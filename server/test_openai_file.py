#!/usr/bin/env python3
import os
import json
import openai
import argparse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description='Test OpenAI API with file attachment')
    parser.add_argument('--input', '-i', type=str, default='sample.txt', help='Input text file path')
    parser.add_argument('--output', '-o', type=str, default='output.json', help='Output JSON file path')
    args = parser.parse_args()
    
    # Get API key from environment variable
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not found.")
        print("Make sure you have a .env file with OPENAI_API_KEY=your-api-key")
        return
    
    # Set up the OpenAI client
    client = openai.OpenAI(api_key=api_key)
    
    # Check if input file exists
    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' not found.")
        print("Creating a sample.txt file for testing...")
        with open('sample.txt', 'w') as f:
            f.write("This is a sample text file for testing OpenAI file attachments.\n")
            f.write("The OpenAI API can process this file and generate insights based on its content.\n")
            f.write("Please analyze this text and provide suggestions for improvement.\n")
        args.input = 'sample.txt'
        print(f"Created sample file: {args.input}")
    
    print(f"Using API key: {api_key[:5]}...{api_key[-4:]}")
    print(f"Reading input file: {args.input}")
    
    try:
        # Upload the file to OpenAI
        with open(args.input, 'rb') as file:
            file_upload_response = client.files.create(
                file=file,
                purpose="assistants"
            )
        
        file_id = file_upload_response.id
        print(f"File uploaded successfully with ID: {file_id}")
        
        # First, read the file content
        with open(args.input, 'r') as f:
            file_content = f.read()
        
        # Create a message with the file content directly in the prompt
        print("Creating chat completion with file content...")
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an assistant that analyzes text files and provides insights."},
                {"role": "user", "content": f"Please analyze the following file content and provide 3 key SEO improvement suggestions in JSON format:\n\n{file_content}"}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        # Process the response
        content = response.choices[0].message.content
        print("\nResponse from OpenAI:")
        print(content)
        
        # Save the response to a JSON file
        try:
            # Try to parse as JSON
            json_content = json.loads(content)
            with open(args.output, 'w') as f:
                json.dump(json_content, f, indent=2)
        except json.JSONDecodeError:
            # If not valid JSON, save as is
            with open(args.output, 'w') as f:
                f.write(content)
        
        print(f"\nResponse saved to: {args.output}")
        
        # Clean up - delete the file from OpenAI since we uploaded it but didn't use it directly
        try:
            client.files.delete(file_id)
            print(f"File {file_id} deleted from OpenAI")
        except Exception as e:
            print(f"Error deleting file from OpenAI: {e}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
