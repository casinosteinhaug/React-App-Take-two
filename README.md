
# LLM Integration Testing

This project integrates multiple LLM providers (OpenAI, Claude, Gemini) for processing text and image-based queries.

## Running Tests

To run the LLM integration tests:

1. Ensure all required API keys are set in your environment:
   - `OPENAI_API_KEY` for OpenAI
   - `ANTHROPIC_API_KEY` for Claude
   - `GOOGLE_API_KEY` for Gemini

2. Run the tests:
```bash
npm test
```

The tests will verify:
- Connection to each LLM service
- Text-only query processing
- Combined image and text query processing

Each test will output detailed results including any errors encountered.

## Supported Features

All LLM drivers support:
- Text-based queries
- Image analysis (with text prompts)
- Conversation history
- Error handling and retry logic

## Adding New Tests

To add new test cases, modify `tests/test-utils.ts`:
1. Add new test prompts to `TEST_PROMPT`
2. Add new test images using `getTestImageBase64()`
3. Implement additional test scenarios in `runTests()`
