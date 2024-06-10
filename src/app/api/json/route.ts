import { openai } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';
import { z, ZodTypeAny } from 'zod';
import { EXAMPLE_ANSWER, EXAMPLE_PROMPT } from './exam';


const determineSchemaType = (input: any): string => {
  if (Array.isArray(input)) {
    return 'array';
  }
  if (typeof input === 'object' && input !== null && input.type) {
    return input.type;
  }
  return typeof input;
};


const jsonToSchema = (input: any): ZodTypeAny => {
  const type = determineSchemaType(input);

  switch (type) {
    case 'string':
      return z.string().nullable();
    case 'number':
      return z.number().nullable();
    case 'boolean':
      return z.boolean().nullable();
    case 'array':
      return z.array(jsonToSchema(input[0])).nullable();
    case 'object':
      const shape: Record<string, ZodTypeAny> = {};
      for (const key in input) {
        if (key !== 'type') {
          shape[key] = jsonToSchema(input[key]);
        }
      }
      return z.object(shape).nullable();
    default:
      throw new Error(`Unsupported schema type: ${type}`);
  }
};


class RetryPromise<T> extends Promise<T> {
  static retry<T>(
    retries: number,
    executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const attempt = (retryCount: number) => {
        executor(resolve, (err) => {
          if (retryCount <= 1) {
            reject(err);
          } else {
            console.log(`retrying due to error: ${JSON.stringify(err, null, 2)}`);
            attempt(retryCount - 1);
          }
        });
      };
      attempt(retries);
    });
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

   
    const baseSchema = z.object({
      data: z.string(),
      format: z.object({}).passthrough(), 
    });

    const { data, format } = baseSchema.parse(body);

    const dynamicSchema = jsonToSchema(format);

    const validationResult = await RetryPromise.retry<object>(
      3,
      async (resolve, reject) => {
        try {
         const content = `DATA: \n"${data}"\n\n-----------\nExpected JSON format: 
         ${JSON.stringify(format, null, 2)}
         }
         \n\n-----------\nValid JSON output in expected format:`
         
          const res = await openai.chat.completions.create({ 
            model: "gpt-4o",
            messages: [
              {
                role: "assistant",
                content: " you are an AI assistant that converts data into the attached JSON format. YOU respond with nothing but valid JSON based on the input data YOU OUTPUT SHOULD BE DIRECTLY be Valid JSON. nothing added before or after .   YOU will begin with the opening curly brace { and end with the closing curly brace } output should be directly valid JSON.only if you absolutely cannot convert the data to JSON, you may respond with an empty string.",
              },
              {
                role: "user",
                content: EXAMPLE_PROMPT,
              },
              { role:"user" ,content: EXAMPLE_ANSWER, },
              { role: "user", content}
            ],
          })
          const text = res.choices[0].message.content;
          const parsedRes = JSON.parse(text || "");
          const validationResult = dynamicSchema.parse(parsedRes);
          resolve(validationResult);
        } catch (err) {
          reject(err);
        }  
      }
    );

    return NextResponse.json(validationResult, { status: 200 });
  } catch (err:any) {
    console.error('Error processing request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
    // this project is used to convert data into JSON format based on the given schema.
  }
};
