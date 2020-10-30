const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;

const FacilitySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      maxlength: [50, 'Name can not be more than 50 characters'],
      unique: true,
      trim: true,
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters'],
      trim: true,
    },
    campus: {
      type: String,
      required: [true, 'Please add a campus'],
      enum: ['legon', 'city'],
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
        required: true,
      },
    },
    address: String,
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'classroom',
        'general use',
        'labouratory',
        'office',
        'residential',
        'special use',
        'study',
        'support',
        'other',
      ],
    },
    photos: {
      type: [String],
      required: [true, 'Please add at least one photo'],
      default: ['no-photo.jpg'],
      validate: [validatePhotosLength, 'Can not add more than five photos'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    /**
     * Figure out how to properly store working hours in the format of:
     *
     *  */
    hours: {
      mon: { open: { type: Number }, close: { type: Number } },
      tue: { open: { type: Number }, close: { type: Number } },
      wed: { open: { type: Number }, close: { type: Number } },
      thu: { open: { type: Number }, close: { type: Number } },
      fri: { open: { type: Number }, close: { type: Number } },
      sat: { open: { type: Number }, close: { type: Number } },
      sun: { open: { type: Number }, close: { type: Number } },
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

function validatePhotosLength(val) {
  return val.length <= 5;
}

// Create place slug from the name
FacilitySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Reverse populate with virtual rooms
FacilitySchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'facility',
  justOne: false, // return all rooms
});

module.exports = mongoose.model('Facility', FacilitySchema);
