const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salarySchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'employee',
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  baseSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  bonuses: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String
    }
  }],
  deductions: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String
    }
  }],
  totalSalary: {
    type: Number,
  },
  note: {
    type: String
  },
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'PAID'],
    default: 'DRAFT'
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}, {
  timestamps: true
});
salarySchema.pre('save', function (next) {
  if (!this.isModified('baseSalary') && !this.isModified('allowances') &&
    !this.isModified('bonuses') && !this.isModified('deductions')) {
    return next();
  }

  let total = this.baseSalary;

  // Cộng các khoản phụ cấp
  if (this.allowances && this.allowances.length > 0) {
    total += this.allowances.reduce((sum, item) => sum + item.amount, 0);
  }

  // Cộng các khoản thưởng
  if (this.bonuses && this.bonuses.length > 0) {
    total += this.bonuses.reduce((sum, item) => sum + item.amount, 0);
  }

  // Trừ các khoản khấu trừ
  if (this.deductions && this.deductions.length > 0) {
    total -= this.deductions.reduce((sum, item) => sum + item.amount, 0);
  }

  this.totalSalary = total;
  next();
});

module.exports = mongoose.model('salary', salarySchema);