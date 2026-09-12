const bcrypt = require('bcryptjs');

// Simple unique ID generator mimicking MongoDB ObjectId
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = 'xxxxxxxxxxxxxxxx'
    .replace(/[x]/g, () => Math.floor(Math.random() * 16).toString(16))
    .toLowerCase();
  return timestamp + random;
};

// Global in-memory storage arrays
const db = {
  users: [],
  medicines: [],
  requests: [],
  notifications: [],
  auditLogs: [],
  mediPointsTransactions: [],
};

// Helper for User documents
class MemoryUser {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.name = data.name;
    this.email = (data.email || '').toLowerCase();
    this.password = data.password;
    this.role = data.role || 'user';
    this.mediPoints = Number(data.mediPoints) || 0;
    this.isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
    this.lastActiveAt = data.lastActiveAt ? new Date(data.lastActiveAt) : new Date();
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.users.findIndex((u) => u._id.toString() === this._id.toString());
    if (idx !== -1) {
      db.users[idx] = this;
    } else {
      db.users.push(this);
    }
    return this;
  }

  async matchPassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }

  toObject() {
    return { ...this };
  }
}

// Helper for Medicine documents
class MemoryMedicine {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.name = data.name;
    this.genericName = data.genericName;
    this.strength = data.strength;
    this.category = data.category || 'General Health';
    this.quantity = Number(data.quantity) || 0;
    this.originalQuantity = Number(data.originalQuantity !== undefined ? data.originalQuantity : data.quantity) || this.quantity;
    this.batchNumber = data.batchNumber;
    this.expiryDate = new Date(data.expiryDate);
    this.storageCondition = data.storageCondition;
    this.packageCondition = data.packageCondition;
    this.imageUrl = data.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';
    this.originalPrice = Number(data.originalPrice) || 200;
    this.affordablePrice = Number(data.affordablePrice) || 45;
    this.prescriptionRequired = Boolean(data.prescriptionRequired);
    this.status = data.status || 'PENDING';
    this.donorId = data.donorId;
    this.verifiedBy = data.verifiedBy || null;
    this.rejectionReason = data.rejectionReason || null;
    this.activeRequestId = data.activeRequestId || null;
    this.approvedAt = data.approvedAt || null;
    this.dispensedAt = data.dispensedAt || null;
    this.pointsAwarded = Boolean(data.pointsAwarded);
    this.additionalNotes = data.additionalNotes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.medicines.findIndex((m) => m._id.toString() === this._id.toString());
    if (idx !== -1) {
      db.medicines[idx] = this;
    } else {
      db.medicines.push(this);
    }
    return this;
  }
}

// Helper for MedicineRequest documents
class MemoryRequest {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.userId = data.userId;
    this.medicineId = data.medicineId;
    this.donorId = data.donorId || null;
    this.quantity = Number(data.quantity) || 1;
    this.status = data.status || 'Pending';
    this.prescriptionVerificationConfirmed = Boolean(data.prescriptionVerificationConfirmed);
    this.deliveryAddress = data.deliveryAddress || 'Demo Clinic Center';
    this.contactPhone = data.contactPhone || '+91 98765 43210';
    this.unitAccessFee = Number(data.unitAccessFee) || 0;
    this.totalAccessFee = Number(data.totalAccessFee) || 0;
    this.pointsUsed = Number(data.pointsUsed) || 0;
    this.pointsDiscount = Number(data.pointsDiscount) || 0;
    this.finalAccessFee = Number(data.finalAccessFee) || 0;
    this.paymentStatus = data.paymentStatus || 'DEMO_PAID';
    this.paymentMode = data.paymentMode || 'DEMO_ACCESS_FEE';
    this.adminNotes = data.adminNotes || '';
    this.reasonNotes = data.reasonNotes || '';
    this.rejectionReason = data.rejectionReason || null;
    this.approvedAt = data.approvedAt || null;
    this.dispensedAt = data.dispensedAt || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.requests.findIndex((r) => r._id.toString() === this._id.toString());
    if (idx !== -1) {
      db.requests[idx] = this;
    } else {
      db.requests.push(this);
    }
    return this;
  }
}

// Helper for Notification documents
class MemoryNotification {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.userId = data.userId ? (data.userId._id || data.userId).toString() : '';
    this.type = data.type || 'general';
    this.title = data.title || '';
    this.message = data.message || '';
    this.medicineId = data.medicineId || null;
    this.requestId = data.requestId || null;
    this.link = data.link || '/track-activity';
    this.read = Boolean(data.read);
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.notifications.findIndex((n) => n._id.toString() === this._id.toString());
    if (idx !== -1) {
      db.notifications[idx] = this;
    } else {
      db.notifications.push(this);
    }
    return this;
  }
}

// Chainable single-item query runner
class MemorySingleQuery {
  constructor(item) {
    this.item = item || null;
    this.populateTasks = [];
  }

  select() {
    return this;
  }

  populate(field, select) {
    this.populateTasks.push({ field, select });
    return this;
  }

  async exec() {
    if (!this.item) return null;
    const cloned = Object.assign(Object.create(Object.getPrototypeOf(this.item)), this.item);
    for (const task of this.populateTasks) {
      if (task.field === 'donorId' && cloned.donorId) {
        const u = db.users.find((u) => u._id.toString() === (cloned.donorId._id || cloned.donorId).toString());
        if (u) cloned.donorId = { _id: u._id, name: u.name, email: u.email, role: u.role };
      } else if (task.field === 'verifiedBy' && cloned.verifiedBy) {
        const u = db.users.find((u) => u._id.toString() === (cloned.verifiedBy._id || cloned.verifiedBy).toString());
        if (u) cloned.verifiedBy = { _id: u._id, name: u.name };
      } else if (task.field === 'userId' && cloned.userId) {
        const u = db.users.find((u) => u._id.toString() === (cloned.userId._id || cloned.userId).toString());
        if (u) cloned.userId = { _id: u._id, name: u.name, email: u.email };
      } else if (task.field === 'medicineId' && cloned.medicineId) {
        const m = db.medicines.find((m) => m._id.toString() === (cloned.medicineId._id || cloned.medicineId).toString());
        if (m) {
          cloned.medicineId = Object.assign(Object.create(Object.getPrototypeOf(m)), m);
          if (cloned.medicineId.donorId) {
            const du = db.users.find((u) => u._id.toString() === (cloned.medicineId.donorId._id || cloned.medicineId.donorId).toString());
            if (du) cloned.medicineId.donorId = { _id: du._id, name: du.name, email: du.email, role: du.role };
          }
          if (cloned.medicineId.verifiedBy) {
            const vu = db.users.find((u) => u._id.toString() === (cloned.medicineId.verifiedBy._id || cloned.medicineId.verifiedBy).toString());
            if (vu) cloned.medicineId.verifiedBy = { _id: vu._id, name: vu.name };
          }
        }
      } else if (task.field === 'activeRequestId' && cloned.activeRequestId) {
        const r = db.requests.find((r) => r._id.toString() === (cloned.activeRequestId._id || cloned.activeRequestId).toString());
        if (r) {
          cloned.activeRequestId = Object.assign(Object.create(Object.getPrototypeOf(r)), r);
          if (cloned.activeRequestId.userId) {
            const ru = db.users.find((u) => u._id.toString() === (cloned.activeRequestId.userId._id || cloned.activeRequestId.userId).toString());
            if (ru) cloned.activeRequestId.userId = { _id: ru._id, name: ru.name, email: ru.email };
          }
        }
      } else if (task.field === 'requestId' && cloned.requestId) {
        const r = db.requests.find((r) => r._id.toString() === (cloned.requestId._id || cloned.requestId).toString());
        if (r) cloned.requestId = Object.assign(Object.create(Object.getPrototypeOf(r)), r);
      }
    }

    return cloned;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

// Chainable list query runner
class MemoryQuery {
  constructor(items) {
    this.items = [...items];
    this.populateTasks = [];
    this.sortCriteria = null;
  }

  populate(field, select) {
    this.populateTasks.push({ field, select });
    return this;
  }

  select() {
    return this;
  }

  sort(sortObj) {
    this.sortCriteria = sortObj;
    return this;
  }

  limit(limitNum) {
    this.limitCount = limitNum;
    return this;
  }

  skip(skipNum) {
    this.skipCount = skipNum;
    return this;
  }

  async exec() {
    let result = this.items.map((item) => {
      return Object.assign(Object.create(Object.getPrototypeOf(item)), item);
    });

    // Populate references
    for (const task of this.populateTasks) {
      result.forEach((item) => {
        if (task.field === 'donorId' && item.donorId) {
          const u = db.users.find((u) => u._id.toString() === (item.donorId._id || item.donorId).toString());
          if (u) item.donorId = { _id: u._id, name: u.name, email: u.email, role: u.role };
        } else if (task.field === 'verifiedBy' && item.verifiedBy) {
          const u = db.users.find((u) => u._id.toString() === (item.verifiedBy._id || item.verifiedBy).toString());
          if (u) item.verifiedBy = { _id: u._id, name: u.name };
        } else if (task.field === 'userId' && item.userId) {
          const u = db.users.find((u) => u._id.toString() === (item.userId._id || item.userId).toString());
          if (u) item.userId = { _id: u._id, name: u.name, email: u.email };
        } else if (task.field === 'medicineId' && item.medicineId) {
          const m = db.medicines.find((m) => m._id.toString() === (item.medicineId._id || item.medicineId).toString());
          if (m) {
            item.medicineId = Object.assign(Object.create(Object.getPrototypeOf(m)), m);
            if (item.medicineId.donorId) {
              const du = db.users.find((u) => u._id.toString() === (item.medicineId.donorId._id || item.medicineId.donorId).toString());
              if (du) item.medicineId.donorId = { _id: du._id, name: du.name, email: du.email, role: du.role };
            }
            if (item.medicineId.verifiedBy) {
              const vu = db.users.find((u) => u._id.toString() === (item.medicineId.verifiedBy._id || item.medicineId.verifiedBy).toString());
              if (vu) item.medicineId.verifiedBy = { _id: vu._id, name: vu.name };
            }
          }
        } else if (task.field === 'activeRequestId' && item.activeRequestId) {
          const r = db.requests.find((r) => r._id.toString() === (item.activeRequestId._id || item.activeRequestId).toString());
          if (r) {
            item.activeRequestId = Object.assign(Object.create(Object.getPrototypeOf(r)), r);
            if (item.activeRequestId.userId) {
              const ru = db.users.find((u) => u._id.toString() === (item.activeRequestId.userId._id || item.activeRequestId.userId).toString());
              if (ru) item.activeRequestId.userId = { _id: ru._id, name: ru.name, email: ru.email };
            }
          }
        } else if (task.field === 'requestId' && item.requestId) {
          const r = db.requests.find((r) => r._id.toString() === (item.requestId._id || item.requestId).toString());
          if (r) item.requestId = Object.assign(Object.create(Object.getPrototypeOf(r)), r);
        }
      });
    }

    // Sort
    if (this.sortCriteria) {
      const [key, dir] = Object.entries(this.sortCriteria)[0] || [];
      if (key) {
        result.sort((a, b) => {
          let valA = a[key];
          let valB = b[key];
          if (valA instanceof Date) valA = valA.getTime();
          if (valB instanceof Date) valB = valB.getTime();
          if (valA < valB) return dir === 1 ? -1 : 1;
          if (valA > valB) return dir === 1 ? 1 : -1;
          return 0;
        });
      }
    }

    if (this.skipCount) {
      result = result.slice(this.skipCount);
    }
    if (this.limitCount) {
      result = result.slice(0, this.limitCount);
    }

    return result;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

// Query match helper
const matchQuery = (item, query = {}) => {
  for (const [key, condition] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(condition)) {
      const matchedAny = condition.some((cond) => matchQuery(item, cond));
      if (!matchedAny) return false;
      continue;
    }

    const itemVal = item[key];

    if (condition && typeof condition === 'object' && Array.isArray(condition.$in)) {
      if (!condition.$in.includes(itemVal)) return false;
    } else if (condition && typeof condition === 'object' && condition.$regex) {
      const regex = new RegExp(condition.$regex, condition.$options || '');
      if (!regex.test(itemVal || '')) return false;
    } else if (condition && typeof condition === 'object' && condition.$lte !== undefined) {
      const itemNum = itemVal instanceof Date ? itemVal.getTime() : Number(itemVal);
      const targetNum = condition.$lte instanceof Date ? condition.$lte.getTime() : Number(condition.$lte);
      if (itemNum > targetNum) return false;
    } else if (condition && typeof condition === 'object' && condition.$gt !== undefined) {
      const itemNum = itemVal instanceof Date ? itemVal.getTime() : Number(itemVal);
      const targetNum = condition.$gt instanceof Date ? condition.$gt.getTime() : Number(condition.$gt);
      if (itemNum <= targetNum) return false;
    } else if (condition && typeof condition === 'object' && condition.$gte !== undefined) {
      const itemNum = itemVal instanceof Date ? itemVal.getTime() : Number(itemVal);
      const targetNum = condition.$gte instanceof Date ? condition.$gte.getTime() : Number(condition.$gte);
      if (itemNum < targetNum) return false;
    } else if ((key === 'donorId' || key === 'userId' || key === 'medicineId' || key === '_id') && condition) {
      const targetId = condition._id ? condition._id.toString() : condition.toString();
      const currentId = itemVal && itemVal._id ? itemVal._id.toString() : (itemVal ? itemVal.toString() : '');
      if (currentId !== targetId) return false;
    } else if (condition !== undefined) {
      if (itemVal !== condition) return false;
    }
  }
  return true;
};

// USER STORE ADAPTER
const UserStore = {
  find(query = {}) {
    const filtered = db.users.filter((u) => matchQuery(u, query));
    return new MemoryQuery(filtered);
  },

  findOne(query) {
    const user = db.users.find((u) => matchQuery(u, query));
    return new MemorySingleQuery(user);
  },

  findById(id) {
    const user = db.users.find((u) => u._id.toString() === (id ? id.toString() : ''));
    return new MemorySingleQuery(user);
  },

  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const user = new MemoryUser({ ...data, password: hashedPassword });
    db.users.push(user);
    return user;
  },

  async countDocuments(query = {}) {
    return db.users.filter((u) => matchQuery(u, query)).length;
  },

  async deleteMany() {
    db.users = [];
    return { deletedCount: 0 };
  },
};

// MEDICINE STORE ADAPTER
const MedicineStore = {
  find(query = {}) {
    const filtered = db.medicines.filter((m) => matchQuery(m, query));
    return new MemoryQuery(filtered);
  },

  findOne(query = {}) {
    const med = db.medicines.find((m) => matchQuery(m, query));
    return new MemorySingleQuery(med);
  },

  findById(id) {
    const med = db.medicines.find((m) => m._id.toString() === (id ? id.toString() : ''));
    return new MemorySingleQuery(med);
  },

  async create(data) {
    const med = new MemoryMedicine(data);
    db.medicines.push(med);
    return med;
  },

  async insertMany(list) {
    const created = list.map((item) => new MemoryMedicine(item));
    db.medicines.push(...created);
    return created;
  },

  async countDocuments(query = {}) {
    return db.medicines.filter((m) => matchQuery(m, query)).length;
  },

  async deleteMany() {
    db.medicines = [];
    return { deletedCount: 0 };
  },
};

// MEDICINE REQUEST STORE ADAPTER
const RequestStore = {
  find(query = {}) {
    const filtered = db.requests.filter((r) => matchQuery(r, query));
    return new MemoryQuery(filtered);
  },

  findOne(query = {}) {
    const req = db.requests.find((r) => matchQuery(r, query));
    return new MemorySingleQuery(req);
  },

  findById(id) {
    const req = db.requests.find((r) => r._id.toString() === (id ? id.toString() : ''));
    return new MemorySingleQuery(req);
  },

  async create(data) {
    const req = new MemoryRequest(data);
    db.requests.push(req);
    return req;
  },

  async countDocuments(query = {}) {
    return db.requests.filter((r) => matchQuery(r, query)).length;
  },

  async deleteMany() {
    db.requests = [];
    return { deletedCount: 0 };
  },
};

// NOTIFICATION STORE ADAPTER
const NotificationStore = {
  find(query = {}) {
    const filtered = db.notifications.filter((n) => matchQuery(n, query));
    return new MemoryQuery(filtered);
  },

  findById(id) {
    const n = db.notifications.find((n) => n._id.toString() === (id ? id.toString() : ''));
    return new MemorySingleQuery(n);
  },

  findOne(query = {}) {
    const n = db.notifications.find((n) => matchQuery(n, query));
    return new MemorySingleQuery(n);
  },

  async create(data) {
    if (Array.isArray(data)) {
      return this.insertMany(data);
    }
    const n = new MemoryNotification(data);
    db.notifications.push(n);
    return n;
  },

  async insertMany(list) {
    const created = list.map((item) => new MemoryNotification(item));
    db.notifications.push(...created);
    return created;
  },

  async countDocuments(query = {}) {
    return db.notifications.filter((n) => matchQuery(n, query)).length;
  },

  async updateMany(query = {}, update = {}) {
    let count = 0;
    db.notifications.forEach((n) => {
      if (matchQuery(n, query)) {
        if (update.$set) {
          Object.assign(n, update.$set);
        } else {
          Object.assign(n, update);
        }
        count++;
      }
    });
    return { modifiedCount: count };
  },

  async deleteMany() {
    db.notifications = [];
    return { deletedCount: 0 };
  },
};

// Helper for AuditLog documents
class MemoryAuditLog {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    this.actor = data.actor || 'System';
    this.actorId = data.actorId || null;
    this.actorRole = data.actorRole || 'system';
    this.action = data.action || 'ACTIVITY';
    this.entity = data.entity || 'System';
    this.entityId = data.entityId ? data.entityId.toString() : '';
    this.details = data.details || '';
    this.result = data.result || 'SUCCESS';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.auditLogs.findIndex((a) => a._id.toString() === this._id.toString());
    if (idx !== -1) {
      db.auditLogs[idx] = this;
    } else {
      db.auditLogs.push(this);
    }
    return this;
  }
}

// AUDIT LOG STORE ADAPTER
const AuditLogStore = {
  find(query = {}) {
    const filtered = db.auditLogs.filter((a) => matchQuery(a, query));
    return new MemoryQuery(filtered);
  },

  findById(id) {
    const a = db.auditLogs.find((item) => item._id.toString() === (id ? id.toString() : ''));
    return new MemorySingleQuery(a);
  },

  async create(data) {
    if (Array.isArray(data)) {
      return this.insertMany(data);
    }
    const log = new MemoryAuditLog(data);
    db.auditLogs.unshift(log); // newest first
    return log;
  },

  async insertMany(list) {
    const created = list.map((item) => new MemoryAuditLog(item));
    db.auditLogs.unshift(...created);
    return created;
  },

  async countDocuments(query = {}) {
    return db.auditLogs.filter((a) => matchQuery(a, query)).length;
  },

  async deleteMany() {
    db.auditLogs = [];
    return { deletedCount: 0 };
  },
};

// Helper for MediPointsTransaction documents
class MemoryMediPointsTransaction {
  constructor(data) {
    this._id = data._id ? data._id.toString() : generateId();
    this.userId = data.userId;
    this.points = Number(data.points) || 0;
    this.type = data.type || 'DONATION_REWARD';
    this.description = data.description || '';
    this.referenceId = data.referenceId ? data.referenceId.toString() : null;
    this.balanceAfter = Number(data.balanceAfter) || 0;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  async save() {
    this.updatedAt = new Date();
    const idx = db.mediPointsTransactions.findIndex((t) => t._id.toString() === this._id.toString());
    if (idx !== -1) {
      db.mediPointsTransactions[idx] = this;
    } else {
      db.mediPointsTransactions.push(this);
    }
    return this;
  }
}

// MEDIPOINTS TRANSACTION STORE ADAPTER
const MediPointsTransactionStore = {
  find(query = {}) {
    const filtered = db.mediPointsTransactions.filter((t) => matchQuery(t, query));
    return new MemoryQuery(filtered);
  },

  findById(id) {
    const item = db.mediPointsTransactions.find((t) => t._id.toString() === (id ? id.toString() : ''));
    return new MemorySingleQuery(item);
  },

  async create(data) {
    if (Array.isArray(data)) {
      return this.insertMany(data);
    }
    const tx = new MemoryMediPointsTransaction(data);
    db.mediPointsTransactions.unshift(tx); // newest first
    return tx;
  },

  async insertMany(list) {
    const created = list.map((item) => new MemoryMediPointsTransaction(item));
    db.mediPointsTransactions.unshift(...created);
    return created;
  },

  async countDocuments(query = {}) {
    return db.mediPointsTransactions.filter((t) => matchQuery(t, query)).length;
  },

  async deleteMany() {
    db.mediPointsTransactions = [];
    return { deletedCount: 0 };
  },
};

module.exports = {
  db,
  UserStore,
  MedicineStore,
  RequestStore,
  NotificationStore,
  AuditLogStore,
  MediPointsTransactionStore,
};
