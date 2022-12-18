const dotenv = require("dotenv");
dotenv.config();

const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
});

// Custom Config for Random Bucket Name Generator
const customConfig = {
  dictionaries: [adjectives, colors, animals],
  separator: "-",
};

// Random Bucket Name Creator Function
const randomName = uniqueNamesGenerator(customConfig);

const createRandomBucketName = () => {
  let bucketName = randomName + "-";
  let bucketNameSuffix = Math.floor(Math.random() * 100000000);
  bucketName += bucketNameSuffix;
  return bucketName.toLowerCase();
};

const BUCKET_NAME = createRandomBucketName();

// append random bucket name to randomBucketName.txt file
const fs = require("fs");
fs.appendFile("randomBucketName.txt", BUCKET_NAME + "\n", function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Random Bucket Name "${BUCKET_NAME}" created`);
  }
});

// CRUD Operations

// CREATE - Create Bucket
const createBucket = (bucketName) => {
  // Create the parameters for calling createBucket
  let bucketParams = {
    Bucket: bucketName,
  };

  // call S3 to create the bucket
  s3.createBucket(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Location);
    }
  });
};

// READ - List buckets
const listBuckets = (s3) => {
  s3.listBuckets(function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Buckets);
    }
  });
};

// CREATE - Upload files
const uploadFile = (filePath, bucketName, keyName) => {
  let fs = require("fs");
  // Read the file
  const file = fs.readFileSync(filePath);

  // Setting up S3 upload parameters
  const uploadParams = {
    Bucket: bucketName, // Bucket into which you want to upload file
    Key: keyName, // Name by which you want to save it
    Body: file, // Local file
  };

  s3.upload(uploadParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    }
    if (data) {
      console.log("Upload Success", data.Location);
    }
  });
};

// READ - List files in Bucket
const listObjectsInBucket = (bucketName) => {
  // Create the parameters for calling listObjects
  let bucketParams = {
    Bucket: bucketName,
  };

  // Call S3 to obtain a list of the objects in the bucket
  s3.listObjects(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};

// UPDATE - Update file in Bucket
const renameObjectsInBucket = (bucketName, oldKeyName, newKeyName) => {
  // Create the parameters for calling listObjects
  let bucketParams = {
    Bucket: bucketName,
    CopySource: bucketName + "/" + oldKeyName,
    Key: newKeyName,
  };

  // Call S3 to rename the objects in the bucket
  s3.copyObject(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};

// DELETE - Delete bucket // WON'T DELETE BUCKET IF ITS NOT EMPTY
const deleteSingleBucket = (bucketName) => {
  // Create params for S3.deleteBucket
  let bucketParams = {
    Bucket: bucketName,
  };

  // Call S3 to delete the bucket
  s3.deleteBucket(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};

// DELETE - Delete multiple buckets // WILL DELETE BUCKET IF ITS NOT EMPTY
const deleteMultipleBuckets = (bucketNames) => {
  // Loop through array of bucket names
  for (let i = 0; i < bucketNames.length; i++) {
    // Create params for S3.deleteBucket
    let bucketParams = {
      Bucket: bucketNames[i],
    };

    // Call S3 to delete the bucket
    s3.deleteBucket(bucketParams, function (err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data);
      }
    });
  }
};

// DELETE - Delete single file in Bucket
const deleteSingleObjectInBucket = (bucketName, keyName) => {
  // Create the parameters for calling listObjects
  let bucketParams = {
    Bucket: bucketName,
    Delete: {
      Objects: [
        {
          Key: keyName,
        },
      ],
    },
  };

  // Call S3 to delete the objects in the bucket
  s3.deleteObjects(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};

// DELETE - Delete multiple file(s) in Bucket using loop
const deleteMultipleObjectsInBucket = (bucketName, keyNames) => {
  // Create the parameters for calling listObjects
  let bucketParams = {
    Bucket: bucketName,
    Delete: {
      Objects: [],
    },
  };

  // Loop through array of key names and add to bucketParams
  for (let i = 0; i < keyNames.length; i++) {
    bucketParams.Delete.Objects.push({
      Key: keyNames[i],
    });
  }

  // Call S3 to delete the objects in the bucket
  s3.deleteObjects(bucketParams, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
};

// DOWNLOAD - Download file
const downloadFile = (bucketName, keyName, filePath) => {
  // Create the parameters for calling listObjects
  let bucketParams = {
    Bucket: bucketName,
    Key: keyName,
  };

  // Create the file to store in root folder // filePath is the same uploadFile function - change in both locations if desired
  const file = require("fs").createWriteStream(filePath);

  // Call S3 to retrieve the file
  s3.getObject(bucketParams)
    .createReadStream()
    .pipe(file)
    .on("error", function (err) {
      console.log("Error", err);
    })
    .on("close", function () {
      console.log("Done");
    });
};

// sleeper function to wait for async functions to finish
function sleep(ms) {
  console.log("Wait...");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main Function to run all desired CRUD operations // Comment out functions you don't want to run
async function main() {
  // CREATE - Create Bucket function call
  console.log("\nCreating bucket : ");
  createBucket(BUCKET_NAME);
  await sleep(5000);

  // READ - List buckets function call
  console.log("\nListing out all the buckets in your AWS S3: ");
  listBuckets(s3);
  await sleep(5000);

  // CREATE - Upload files function call
  console.log("\nUploading image1 to " + BUCKET_NAME);
  // loads from root folder - change path to desired folder when running locally
  uploadFile(
    "/assets/daniel-norin-lBhhnhndpE0-unsplash.jpg",
    BUCKET_NAME,
    "football.jpg"
  );
  await sleep(5000);

  console.log("\nUploading image2 to " + BUCKET_NAME);
  // loads from root folder - change path to desired folder when running locally
  uploadFile(
    "/assets/florian-olivo-4hbJ-eymZ1o-unsplash.jpg",
    BUCKET_NAME,
    "code.jpg"
  );
  await sleep(5000);

  // READ - List files in Bucket function call
  console.log(
    "\nListing out all the files/objects in the bucket " + BUCKET_NAME
  );
  listObjectsInBucket(BUCKET_NAME);
  await sleep(5000);

  // UPDATE - file Rename function call
  console.log("\nRenaming the file in the bucket " + BUCKET_NAME);
  renameObjectsInBucket(BUCKET_NAME, "football.jpg", "football1.jpg");
  await sleep(5000);

  // DELETE - Delete single file function call
  console.log("\nDeleting file from " + BUCKET_NAME);
  deleteSingleObjectInBucket(BUCKET_NAME, "football1.jpg");
  await sleep(5000);

  // DELETE - Delete multiple files function call
  console.log("\nDeleting file from " + BUCKET_NAME);
  deleteMultipleObjectsInBucket(BUCKET_NAME, [
    "football1.jpg",
    "football.jpg",
    "code.jpg",
  ]);
  await sleep(5000);

  // DELETE - Delete bucket function call
  console.log("\nDeleting bucket : " + BUCKET_NAME);
  deleteSingleBucket(BUCKET_NAME);
  await sleep(5000);

  // DELETE - Delete multiple buckets function call
  console.log("\nDeleting multiple buckets : ");
  deleteMultipleBuckets(["bucket1", "bucket2", "bucket3"]);
  await sleep(5000);

  // DOWNLOAD - Download file function call
  console.log("\nDownloading file from " + BUCKET_NAME);
  downloadFile(BUCKET_NAME, "football.jpg", "football.jpg");
  await sleep(5000);
}
main();
