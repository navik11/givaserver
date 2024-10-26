# Getting Started
- Configure the backend server
- Install dependencies `npm i`

Add 
```
PORT=3001
CORS_ORIGIN = http://localhost:3000

DBConnLink=postgresql://_CONNECTION_URI_
SESSION_EXPIRY=1d
JWT_SECRET=_JWT_SECRET_
CLOUDINARY_CLOUD_NAME=_CLOUD_NAME_
CLOUDINARY_API_KEY=_API_KEY_
CLOUDINARY_API_SECRET=_API_SECRET_

EMAIL_USERNAME=sachidanan22
EMAIL_PASSWORD=_EMAIL_PASS_
```
to `.env` file in root folder

Then start the server by `npm run start`


Have a look at [Postman Collection](https://res.cloudinary.com/dnoszukak/raw/upload/v1729947942/qdodgjzhc6qq95cwueik.json), for better understanding
