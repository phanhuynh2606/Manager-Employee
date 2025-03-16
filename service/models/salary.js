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
  daySalary: [
    {
      day: {
        type: Number,
        required: true,
        min: 1,
        max: 31
      },
      overTimeHours: {
        type: Number,
        required: true,
        min: 0
      },
      workingHours: {
        type: Number,
        required: true,
        min: 0
      },
      periodStart: {
        type: Date,
        required: true
      },
      periodEnd: {
        type: Date,
        required: true
      },
      salary: {
        type: Number,
        required: true,
      }
    }
  ],
  totalSalary: {
    type: Number,
  },
  note: {
    type: String
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('salary', salarySchema);