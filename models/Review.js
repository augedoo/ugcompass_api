const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, 'Please add some text'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, 'Please add a rating between 1 and 10'],
    },
    facility: {
      type: mongoose.Schema.ObjectId,
      ref: 'Facility',
      require: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

// Preview user from submitting more than 1 review per facility
ReviewSchema.index({ facility: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (facilityId) {
  const obj = await this.aggregate([
    {
      $match: { facilty: facilityId },
    },
    {
      $group: {
        _id: '$facility',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    // Save/Update averageRating of facility
    await this.model('Facility').findByIdAndUpdate(facilityId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call averageRating after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.facility);
});

// Call averageRating before remove
ReviewSchema.pre('save', function (next) {
  this.constructor.getAverageRating(this.facility);
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
