const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100,
      minlength: 10,
    },
    text: {
      type: String,
      required: [true, 'Please add some text'],
      trim: true,
      minlength: 10,
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
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
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
      $match: { facility: facilityId },
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
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.facility);
});

module.exports = mongoose.model('Review', ReviewSchema);
