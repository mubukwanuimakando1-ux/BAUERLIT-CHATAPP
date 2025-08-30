
/**
 * Supabase adapter that shims a minimal subset of the Firebase (compat) APIs
 * used in your app: firebase.initializeApp, firebase.auth, firebase.firestore,
 * firebase.storage, collection().doc().get/set/update/delete, add, orderBy,
 * limit, onSnapshot, batch, and a light runTransaction.
 *
 * Drop this in after loading @supabase/supabase-js v2 from CDN.
 */
(function () {
  if (!window.supabase || !supabase.createClient) {
    console.error("[supabase-adapter] @supabase/supabase-js v2 is required before this adapter.");
    return;
  }

  let _sb = null;
  let _bucket = "app-bucket";

  // ---------- helpers ----------
  const isMetaTable = (table) => table === "meta";
  const pkFieldFor = (table) => (isMetaTable(table) ? "key" : "id");

  function asDoc(table, row) {
    // emulate Firestore DocumentSnapshot-ish object
    const _table = table;
    const _row = row;
    return {
      id: row.id ?? row.key,
      data: function () {
        return isMetaTable(_table) ? (_row && _row.data) : _row;
      },
    };
  }

  function asSnapshot(table, rows) {
    const docs = (rows || []).map((r) => asDoc(table, r));
    return {
      forEach: (cb) => docs.forEach(cb),
      docs,
      size: docs.length,
      empty: docs.length === 0,
    };
  }

  // ---------- AUTH SHIM ----------
  const authShim = {
    currentUser: null,
    async signInWithEmailAndPassword(email, password) {
      const { data, error } = await _sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const u = data.user;
      this.currentUser = u ? { uid: u.id, email: u.email } : null;
      return { user: this.currentUser };
    },
    async createUserWithEmailAndPassword(email, password) {
      const { data, error } = await _sb.auth.signUp({ email, password });
      if (error) throw error;
      const u = data.user;
      this.currentUser = u ? { uid: u.id, email: u.email } : null;
      return { user: this.currentUser };
    },
    async signOut() {
      await _sb.auth.signOut();
      this.currentUser = null;
    },
  };

  // ---------- STORAGE SHIM ----------
  const storageShim = {
    ref() {
      return {
        child(path) {
          const $path = path;
          return {
            async put(file) {
              const { error } = await _sb.storage.from(_bucket).upload($path, file, {
                cacheControl: "3600",
                upsert: true,
                contentType: file && file.type ? file.type : undefined,
              });
              if (error) throw error;
              return { ref: this };
            },
            async getDownloadURL() {
              const { data } = _sb.storage.from(_bucket).getPublicUrl($path);
              return data.publicUrl;
            },
          };
        },
      };
    },
  };

  // ---------- FIRESTORE-LIKE SHIM ----------
  class DocRef {
    constructor(table, id) {
      this.table = table;
      this.id = id;
    }
    async get() {
      const pk = pkFieldFor(this.table);
      const q =
        this.table === "meta"
          ? _sb.from(this.table).select("*").eq(pk, this.id).maybeSingle()
          : _sb.from(this.table).select("*").eq(pk, this.id).maybeSingle();
      const { data, error } = await q;
      if (error && error.code !== "PGRST116") throw error;
      const exists = !!data;
      return {
        exists,
        data: () => (exists ? (this.table === "meta" ? data.data : data) : undefined),
        id: this.id,
        ref: this,
      };
    }
    async set(data, opts) {
      const pk = pkFieldFor(this.table);
      let row =
        this.table === "meta"
          ? { [pk]: this.id, data: data }
          : { [pk]: this.id, ...data };
      if (opts && opts.merge) {
        // emulate merge by fetching then shallow merging
        const current = await this.get();
        if (current.exists) {
          const base = current.data();
          row =
            this.table === "meta"
              ? { [pk]: this.id, data: { ...base, ...data } }
              : { [pk]: this.id, ...base, ...data };
        }
      }
      const { error } = await _sb.from(this.table).upsert(row).select().maybeSingle();
      if (error) throw error;
    }
    async update(patch) {
      // same semantics as set(..., {merge:true})
      return this.set(patch, { merge: true });
    }
    async delete() {
      const pk = pkFieldFor(this.table);
      const { error } = await _sb.from(this.table).delete().eq(pk, this.id);
      if (error) throw error;
    }
    onSnapshot(cb) {
      // initial push
      (async () => {
        cb(await this.get());
      })();

      // realtime subscribe to this row
      const pk = pkFieldFor(this.table);
      const channel = _sb
        .channel(`rt:${this.table}:${pk}=${this.id}:${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: this.table, filter: `${pk}=eq.${this.id}` },
          async () => {
            cb(await this.get());
          }
        )
        .subscribe();
      // return unsubscribe
      return () => _sb.removeChannel(channel);
    }
  }

  class QueryRef {
    constructor(table) {
      this.table = table;
      this._order = null;
      this._limit = null;
      this._filters = [];
    }
    where(field, op, value) {
      // supports common operators: '==', '!=', '<', '<=', '>', '>=', 'in'
      this._filters.push({ field, op, value });
      return this;
    }
    orderBy(field, direction) {
      this._order = { field, ascending: direction !== "desc" };
      return this;
    }
    limit(n) {
      this._limit = n;
      return this;
    }
    async get() {
      let q = _sb.from(this.table).select("*");
      // apply stored filters
      if (this._filters && this._filters.length) {
        for (const f of this._filters) {
          const { field, op, value } = f;
          switch (op) {
            case '==': q = q.eq(field, value); break;
            case '===': q = q.eq(field, value); break;
            case '!=': q = q.neq(field, value); break;
            case '<': q = q.lt(field, value); break;
            case '<=': q = q.lte(field, value); break;
            case '>': q = q.gt(field, value); break;
            case '>=': q = q.gte(field, value); break;
            case 'in': q = q.in(field, value); break;
            default: /* unsupported operator */ break;
          }
        }
      }
      if (this._order) q = q.order(this._order.field, { ascending: this._order.ascending });
      if (this._limit) q = q.limit(this._limit);
      const { data, error } = await q;
      if (error) throw error;
      return asSnapshot(this.table, data);
    }
    onSnapshot(cb) {
      // push initial snapshot
      (async () => {
        cb(await this.get());
      })();

      // subscribe to any changes for this table and re-push filtered view
      const channel = _sb
        .channel(`rt:${this.table}:${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "*", schema: "public", table: this.table }, async () => {
          cb(await this.get());
        })
        .subscribe();
      return () => _sb.removeChannel(channel);
    }
  }

  class CollectionRef extends QueryRef {
    constructor(table) {
      super(table);
    }
    doc(id) {
      return new DocRef(this.table, id);
    }
    async add(obj) {
      const { data, error } = await _sb.from(this.table).insert(obj).select().single();
      if (error) throw error;
      return {
        id: data.id ?? data.key,
        ref: new DocRef(this.table, data.id ?? data.key),
      };
    }
  }

  class Batch {
    constructor() {
      this._ops = [];
    }
    set(docRef, data, opts) {
      this._ops.push(() => docRef.set(data, opts));
    }
    delete(docRef) {
      this._ops.push(() => docRef.delete());
    }
    async commit() {
      for (const op of this._ops) {
        await op();
      }
    }
  }

  class FirestoreShim {
    collection(name) {
      return new CollectionRef(name);
    }
    batch() {
      return new Batch();
    }
    async runTransaction(fn) {
      // NOTE: This is NOT a true transaction. For integrity-sensitive logic,
      // move to a Postgres function and call via supabase.rpc in your app code.
      const tx = {
        async get(docRef) {
          return await docRef.get();
        },
        async set(docRef, data, opts) {
          return await docRef.set(data, opts);
        },
        async update(docRef, patch) {
          return await docRef.update(patch);
        },
      };
      return await fn(tx);
    }
  }

  // ---------- PUBLIC API (firebase compat) ----------
  window.firebase = {
    initializeApp(cfg) {
      const url = cfg.supabaseUrl || cfg.url || cfg.authDomain; // allow reusing existing variable name
      const anon =
        cfg.supabaseKey || cfg.anonKey || cfg.apiKey; // allow reusing apiKey to avoid large code edits
      _bucket = cfg.storageBucket || _bucket;
      _sb = supabase.createClient(url, anon);
      window._sb = _sb; // expose for debugging / advanced usage
      window._supabaseStorageBucket = _bucket;

      // prime current user
      _sb.auth.getUser().then(({ data }) => {
        if (data && data.user) {
          authShim.currentUser = { uid: data.user.id, email: data.user.email };
        }
      });

      // pass through for code that expects firebase.initializeApp to return an app
      return { name: "supabase-adapter-app" };
    },
    auth() {
      return authShim;
    },
    firestore() {
      return new FirestoreShim();
    },
    storage() {
      return storageShim;
    },
  };
})();
