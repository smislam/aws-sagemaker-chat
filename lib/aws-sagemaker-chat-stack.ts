import { JumpStartModel, JumpStartSageMakerEndpoint, SageMakerInstanceType } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import path = require('path');

export class AwsSagemakerChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const endpointName = "llama-ep";
    const jumpEndpoint = new JumpStartSageMakerEndpoint(this, 'llama-3-1-8b', {
      endpointName,
      model: JumpStartModel.META_TEXTGENERATION_LLAMA_3_1_8B_2_2_1,
      acceptEula: true,
      instanceType: SageMakerInstanceType.ML_G5_4XLARGE,
      instanceCount: 1
    });

    const sage_caller = new NodejsFunction(this, 'sage-runner', {
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '/../lambda/sage_caller.ts'),
      environment: {
        SAGE_EP_NAME: `jumpstart-${endpointName}`
      },
      logRetention: RetentionDays.ONE_DAY,
      tracing: Tracing.ACTIVE,
      timeout: cdk.Duration.minutes(1)
    });

    jumpEndpoint.grantInvoke(sage_caller);

    sage_caller.addToRolePolicy(new PolicyStatement({
      actions: ['sagemaker:InvokeEndpoint'],
      resources: [`arn:aws:sagemaker:${cdk.Aws.REGION}::endpoint/jumpstart-${endpointName}`]
    }));

    const api = new LambdaRestApi(this, 'test-api', {
      handler: sage_caller
    });

  }
}
