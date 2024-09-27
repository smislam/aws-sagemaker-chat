import { InvokeEndpointCommand, InvokeEndpointCommandInput, SageMakerRuntimeClient } from "@aws-sdk/client-sagemaker-runtime";
import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {

    const badResponse = {
        statusCode: 400,
        body: JSON.stringify('Invalid request.  Give me a valid question!')
    }

    if (event.body && event.body !== "") {
        let body = JSON.parse(event.body);
        if (body.question && body.question !== "") {
            let question = body.question;

            const contentType = 'application/json';
            const sageRuntimeClient = new SageMakerRuntimeClient({region: process.env.REGION});

            const payload = {
                messages: [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": question}
                ],
                parameters: {
                    top_p: 0.6,
                    temperature: 0.7,
                    max_tokens: 512
                }
            };

            const inputCommand: InvokeEndpointCommandInput = { 
                Body: JSON.stringify(payload),
                EndpointName: process.env.SAGE_EP_NAME,
                ContentType: contentType,
            }
            
            const command = new InvokeEndpointCommand(inputCommand);
            const response = await sageRuntimeClient.send(command);
    
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': `${contentType}`
                },
                body: response.Body?.transformToString()
            }
        } else {
            return badResponse;
        }
    } else {
        return badResponse;
    }
}