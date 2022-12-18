# S3 Practice

Full CRUD with S3 Bucket, AWS, and Node.js. Uses a random bucket name generator to create a unique bucket name for each user to avoid bucket name collisions. The bucket name is saved in a text file in the root directory in susbtitution of a database...can be easily modified to use a database.

## Installation

In order to run this app, you will need to create a .env file in the root directory with the following variables:

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

These variables are your AWS access key and secret access key. You can find these in your AWS console.

## Usage

```
npm install
node index.js
```

Before running app, make sure to comment out the desired function(s) in the index.js. The app will run any function(s) that is not commented out.
