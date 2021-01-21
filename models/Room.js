const mongoose = require('mongoose');
const slugify = require('slugify');

const { Schema } = mongoose;

const RoomSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      maxlength: [50, 'Name can not be more than 50 characters'],
      unique: [true, 'A room with this already exists.'],
      trim: true,
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters'],
      trim: true,
    },
    address: String,
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'classroom',
        'general_use',
        'laboratory',
        'office',
        'residential',
        'special_use',
        'study',
        'support',
        'other',
      ],
    },
    photos: {
      type: [String],
      default: [],
      validate: [
        validatePhotosLength,
        `Room can not have more than ${process.env.MAX_ROOM_PHOTOS_UPLOAD} photos`,
      ],
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
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    facility: {
      type: mongoose.Types.ObjectId,
      ref: 'Facility',
      require: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: true,
    },
  },
  { timestamps: true }
);

// validation number of photos to upload validation
function validatePhotosLength(val) {
  return val.length <= process.env.MAX_ROOM_PHOTOS_UPLOAD;
}

// Create place slug from the name
RoomSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Room', RoomSchema);
