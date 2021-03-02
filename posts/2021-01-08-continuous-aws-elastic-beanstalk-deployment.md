---
type: post
title: Continuous AWS Elastic Beanstalk deployment
image: '/images/continuous-aws-elastic-beanstalk-deployment/continuous-aws-elastic-beanstalk-deployment.jpg'
tags: [aws, elastic, beanstalk, deployment, cd, devOps]
excerpt: A simple deployment script tutorial for AWS Elastic Beanstalk using S3 storage and the AWS CLI. 
description: A simple deployment script tutorial for AWS Elastic Beanstalk using S3 storage and the AWS CLI. 
date: 2021-01-08
---

Cloud computing is evolving every day, allowing anybody to deploy their server-side rendered blog with infinite scaling 
with only two clicks, thanks to service like Vercel or Netlify. However, when working in the corporate world where new
vendor assessments take 6 to 12 months, your stuck with what's allowed, add an enterprise VPN on top of that to prevent
any communication from AWS to the code repository you're using, and you're back to drag'n dropping a zip archive of your
project on the AWS portal for each new release.

Not cool.

For my own sanity I had to find a way to automate deployment from the VPN secured code repository to AWS, and what 
better place than the CI/CD pipeline with some Bash scripting for that ? Leveraging the AWS CLI I managed to make 
something good enough, the script is made of 5 blocks:

- Cleaning files, fixing file rights and creating a .zip archive
- Verify if the exact same archive has already been deployed
- Upload the archive on S3
- Trigger the Elastic Beanstalk deploy
- Check if the deployment was successful

Here is a full example for a Laravel project:

```bash
#!/bin/bash

archive="archive.zip"
s3_bucket="elasticbeanstalk-eu-west-3-something"
application_name="myapp"
application_environment="myapp-env"
git_hash=$(git rev-parse --short HEAD)

if [ -f "$archive" ] ; then
    printf "Delete previously created archive\n"
    rm "$archive"
fi

# You might want to delete some files before creating the archive
printf "Delete storage files\n"
rm -rf storage/framework/cache/data/*
rm -rf storage/framework/views/*
rm -rf storage/framework/sessions/*

# Force restricted permission for all files and directories
printf "Apply restricted files and directories permissions\n"
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Give a bit more permissions where it's needed 
chmod -R ug+rwx storage bootstrap/cache

# Create the archive, exclude .env tests, and vendor dependencies that will be installed by EBS
printf "Create the code archive\n"  
zip -q -r $archive * -x .env -x tests\* -x vendor\*

# Check that the latest archive on s3 is not the same as the one we just created to avoid useless deployments
printf "Get the latest deployment checksum\n"
CURRENT_MD5=$(md5sum $archive | cut -d ' ' -f1)
LATEST_MD5=$(aws s3api head-object --bucket $s3_bucket --key $archive | jq -r '.Metadata.md5')

if [ "$CURRENT_MD5" = "$LATEST_MD5" ]; then
    # No deploy required
    printf "The Latest project version is already deployed\n"
else
    # Save the archive to S3 with the MD5 checksum in metadata to simplify checks in the next deployment
    printf "Upload the archive to AWS S3\n"
    aws s3 cp $archive s3://$s3_bucket/ --metadata md5="$CURRENT_MD5"

    # Create a new Elastic Beanstalk application version
    printf "Create EBS application version\n"
    aws elasticbeanstalk create-application-version \
        --application-name $application_name \
        --version-label $git_hash \
        --source-bundle S3Bucket="$s3_bucket",S3Key="$archive"

    # Trigger Elastic Beanstalk environment update, a.k.a, actually starting the deployment
    printf "Update EBS environment\n"
    aws elasticbeanstalk update-environment \
        --application-name $application_name \
        --environment-name $application_environment \
        --version-label $git_hash
        
    # Wait until environment is updated
    printf "Wait for EBS to update the environment\n"
    aws elasticbeanstalk wait environment-updated \
        --version-label $git_hash
        
    # Check if deploy is successful
    printf "Get EBS environment Health Status\n"
    HEALTH_STATUS=$(aws elasticbeanstalk describe-environment-health \
    --environment-name $application_environment \
     --attribute-names HealthStatus | jq -r '.HealthStatus') 
     
    if [ "$HEALTH_STATUS" = "Ok" ]; then
        printf "Deploy successful\n"
    else
        printf "Something went wrong during deploy [Status: $HEALTH_STATUS]\n"
    fi
fi
```

This script assumes that all the call to the AWS CLI won't fail, which isn't great but for the 99.9% of times when AWS
is working as expected, it does the job and avoid the unbearable pain of uploading a zip file by hand on the AWS portal
everytime a new pull request need to be deployed.
