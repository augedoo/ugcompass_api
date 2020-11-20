# UGCompass API

> Backend API for UGCompass application (mobile and web), which is a location directory website application to serve people on University of Ghana campus.

## Usage

Rename "config/config.config.env" to "config/config.env" and update the values/settings to your own

## Install Dependencies

```
npm install
```

## Run App

```
# Run in dev mode
npm run dev

# Run in prod mode
npm start
```

## Database Seeder

To seed the database with users, facilities, rooms and reviews with data from the "\_data" folder, run

```
# Destroy all data
node seeder -d

# Import all data
node seeder -i
```

## Documentation

Extensive documentation of the API is live at [ugcompass.herokuapp.com](https://ugcompass.herokuapp.com/)

- Version: 1.0.0
- License: MIT
- Author: Augustine Amoh Nkansah

## Credits

Credits to Brad Traversy for his enormous contribution to my knowledge in buiding this api successfully. Am most thankful as
most of the ideas and code i used to build this robust api is from his Node.js course. Am most greatful.
