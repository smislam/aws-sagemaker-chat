#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsSagemakerChatStack } from '../lib/aws-sagemaker-chat-stack';

const app = new cdk.App();
new AwsSagemakerChatStack(app, 'AwsSagemakerChatStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
});