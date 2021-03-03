---
type: post
title: Continuous AWS Amplify deployment
image: '/images/continuous-aws-amplify-deployment/continuous-aws-amplify-deployment.jpg'
tags: [aws, amplify, deployment, cd, devOps]
excerpt: A simple deployment script tutorial for AWS Amplify using S3 storage and the AWS CLI. 
description: A simple deployment script tutorial for AWS Amplify using S3 storage and the AWS CLI. 
date: 2021-03-03
---

Is [two blog posts](/2021-01-08-continuous-aws-elastic-beanstalk-deployment.
html) on a similar theme enough to call it a blog series ? Let's say yes and
continue our journey in the world of enterprise deployment where you can't 
use already made DevOps automation integrations because of the company VPN 
configuration.

Again, not cool.

Anyway, finding solutions to problems is the #1 skill of a Software engineer, so
let's dive on how to tackle this one. AWS Amplify is a do-it-all service for 
mobile and web apps, but the feature that got my interest is the static hosting.
I wanted to use Amplify to deploy a [Nuxt.js](https://nuxtjs.org/) static app, 
with built-in global availability and integration to the AWS ecosystem, Amplify 
is a great alternative to Netlify and Vercel for companies that like big hosting 
invoices. Amplify being fairly recent (2018) I tough it would be easier to 
deploy on it than on Elastic Beanstalk, but I was remarkably wrong.

It took me way too much time to write the deployment script for it, as the 
documentation is missing a lot of crucial information, probably because I'm one 
of the few persons on earth that cannot use the built-in repository integration
to enable automatic deployments.

The deployment script that I ended up with is made of 10 steps, yes, 10 steps:

- Creating a .zip archive
- Verify if the exact same archive has already been deployed
- Upload the archive on S3
- Verify the status of the last Amplify job
- Stop the last job if it is still running
- Create a Amplify deployment
- Upload the archive to AWS Amplify deployment URL
- Start the deployment
- Poll the deployment job status until it finish
- Verify if the deployment is successful

Here is a full example for a Nuxt project:

```bash
#!/bin/bash

archive="archive.zip"
s3_bucket="elasticbeanstalk-eu-west-3-something"
amplify_id="something"
git_branch=$(git rev-parse --abbrev-ref HEAD)

if [ -f "$archive" ] ; then
    printf "Delete previously created archive\n"
    rm "$archive"
fi

# We create the Nuxtjs dist/ build directory  
printf "Make bundle build\n"
yarn run build

# Create the archive of the dist/ directory
printf "Create the code archive\n"  
zip -q -r $archive dist/*

# Check that the latest archive on s3 is not the same as the one we just created
# to avoid useless deployments
printf "Generate current deploy checksum\n"
CURRENT_MD5=$(find dist/ -type f -exec md5sum {} \; | sort -k 2 | md5sum)

printf "Verify latest deploy checksum\n"
LATEST_MD5=$(aws s3api head-object --bucket $s3_bucket --key $archive \
  | jq -r '.Metadata.md5')

if [ "$CURRENT_MD5" = "$LATEST_MD5" ]; then
    # No deploy required
    printf "The Latest project version is already deployed\n"
else
    # Save the archive to S3 with the MD5 checksum in metadata to simplify 
    # checks in the next deployment
    aws s3 cp $archive s3://$s3_bucket/ --metadata md5="$CURRENT_MD5"

    # Get the latest Amplify job
    printf "Get latest Amplify job\n"
    aws amplify list-jobs \
        --app-id $amplify_id \
        --branch-name $git_branch \
        --max-items 1 > amplify-last-job.json

    # Store latest Amplify job status and id
    AMPLIFY_LAST_JOB_STATUS=$(cat amplify-last-job.json \
        | jq -r '.jobSummaries[].status')
    AMPLIFY_LAST_JOB_ID=$(cat amplify-last-job.json \
        | jq -r '.jobSummaries[].jobId')

    # Kill the last job if it is still pending from a previous deploy
    if [ "$AMPLIFY_LAST_JOB_STATUS" = "PENDING" ]; then
        aws amplify stop-job \
            --app-id $amplify_id \
            --branch-name $git_branch \
            --job-id $AMPLIFY_LAST_JOB_ID
    fi

    # Create a Amplify deployment
    printf "Create Amplify deployment\n"
    aws amplify create-deployment \
        --app-id $amplify_id \
        --branch-name $git_branch > amplify-deploy.json

    # Retrieve the newly created deployment ID and zip upload URL
    AMPLIFY_ZIP_UPLOAD_URL=$(cat amplify-deploy.json | jq -r '.zipUploadUrl')
    AMPLIFY_JOB_ID=$(cat amplify-deploy.json | jq -r '.jobId')

    # Upload the archive to Amplify
    printf "Upload archive\n"
    curl -H "Content-Type: application/zip" \
        $AMPLIFY_ZIP_UPLOAD_URL \
        --upload-file $archive

    # Start the deployment
    printf "Start Amplify deployment\n"
    aws amplify start-deployment \
        --app-id $amplify_id \
        --branch-name $git_branch \
        --job-id $AMPLIFY_JOB_ID

    while :
    do
        sleep 10

        # Poll the deployment job status every 10 seconds until it's not pending
        # anymore
        STATUS=$(aws amplify get-job \
            --app-id $amplify_id \
            --branch-name $git_branch \
            --job-id $AMPLIFY_JOB_ID \
            | jq -r '.job.summary.status')

        if [ $STATUS != 'PENDING' ]; then
          break
       fi
    done

    printf "Amplify deployment status $STATUS\n"
fi
```

I miss that time when all it took was an FTP, and a bunch of PHP files.
