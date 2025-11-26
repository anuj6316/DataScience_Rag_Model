# Markdown Formatting Guide for BeeBot AI

This guide demonstrates all the markdown formatting features supported in your chatbot responses.


## Headings

Use headings to organize your content hierarchically:

# H1 - Main Title (rarely used in responses)
## H2 - Major Sections (highlighted in bee-yellow)
### H3 - Subsections
#### H4 - Minor subsections


## Text Formatting

- **Bold text** for emphasis and key terms
- *Italic text* for introducing new terminology
- `inline code` for technical terms, function names, or variables
- ~~Strikethrough~~ for corrections or deprecated items


## Lists

### Unordered Lists

- First item
- Second item
  - Nested item 1
  - Nested item 2
- Third item

### Ordered Lists

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

### Task Lists

- [x] Completed task
- [ ] Pending task
- [ ] Another pending task


## Links

Standard markdown links are automatically styled in blue:

- 📄 [Example PDF (Page 5)](http://localhost:8000/pdf/example.pdf#page=5)
- [External Link](https://example.com)
- [Documentation](https://docs.example.com)


## Code Blocks

### Inline Code

Use `backticks` for inline code like `variable_name` or `function()`.

### Code Blocks with Syntax

```python
def process_query(query: str) -> dict:
    """
    Process a user query through the RAG pipeline.
    """
    results = retrieve_documents(query)
    return generate_response(results)
```

```javascript
const fetchData = async (url) => {
  const response = await fetch(url);
  return await response.json();
};
```

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```


## Tables

Tables are great for comparing information or showing structured data:

| Feature           | Description         | Status   |
| ----------------- | ------------------- | -------- |
| Markdown Support  | Full GFM support    | ✅ Active |
| Code Highlighting | Syntax highlighting | ✅ Active |
| Tables            | Responsive tables   | ✅ Active |
| Images            | Image embedding     | ✅ Active |

### Complex Table Example

| Model        | Speed         | Accuracy  | Use Case                             |
| ------------ | ------------- | --------- | ------------------------------------ |
| Google Flash | Fast (2-3s)   | Good      | Quick queries, summaries             |
| Google Pro   | Slower (5-8s) | Excellent | Complex analysis, detailed responses |
| GPT-4        | Medium (3-5s) | Excellent | General purpose                      |


## Blockquotes

Use blockquotes for important definitions or key takeaways:

> **Key Concept**: Retrieval-Augmented Generation (RAG) combines the power of large language models with external knowledge bases to provide accurate, context-aware responses.

> This is a simple blockquote that can span multiple lines and provide additional context or emphasis to important information.


## Horizontal Rules

Use horizontal rules to separate major topic changes:

---


## Images

Images are automatically styled with rounded corners and shadows:

![Example Diagram](https://via.placeholder.com/600x300?text=Example+Diagram)


## Combining Elements

Here's how you can combine multiple markdown elements for rich, well-formatted responses:


## Example: Explaining a Technical Concept


### What is Machine Learning?

**Machine learning** is a subset of *artificial intelligence* that enables systems to learn and improve from experience without being explicitly programmed.


### Key Components

1. **Data**: The foundation of any ML system
   - Training data
   - Validation data
   - Test data

2. **Algorithms**: The methods used to learn patterns
   - Supervised learning
   - Unsupervised learning
   - Reinforcement learning

3. **Models**: The output of the learning process


### Types of Machine Learning

| Type          | Description                      | Example Use Cases                    |
| ------------- | -------------------------------- | ------------------------------------ |
| Supervised    | Learns from labeled data         | Classification, Regression           |
| Unsupervised  | Finds patterns in unlabeled data | Clustering, Dimensionality Reduction |
| Reinforcement | Learns through trial and error   | Game playing, Robotics               |


### Code Example

Here's a simple example of training a model:

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Create and train the model
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.2%}")
```


### Important Considerations

> **Note**: Always validate your model on unseen data to ensure it generalizes well and doesn't overfit to the training data.


### Further Reading

For more information, check out these resources:

- 📄 [Introduction to ML (Page 12)](http://localhost:8000/pdf/ml_basics.pdf#page=12)
- 📄 [Advanced Techniques (Page 45)](http://localhost:8000/pdf/advanced_ml.pdf#page=45)

---


## Best Practices for Formatting Responses

1. **Use headings** to create clear structure
   - H2 for main sections
   - H3 for subsections

2. **Add spacing** between sections
   - Use blank lines liberally
   - Separate different topics with horizontal rules

3. **Highlight key information**
   - Use **bold** for important terms (2-3 per paragraph max)
   - Use `code formatting` for technical terms
   - Use blockquotes for critical takeaways

4. **Organize with lists**
   - Numbered lists for sequential steps
   - Bullet points for features or options
   - Task lists for checklists

5. **Include tables** for comparisons
   - Keep tables concise
   - Use clear headers
   - Align content appropriately

6. **Cite sources** with proper links
   - Always include the 📄 emoji for PDFs
   - Include page numbers when available
   - Format as: `📄 [filename.pdf (Page X)](URL)`


## Spacing Guidelines

- **Between paragraphs**: 1 blank line
- **Between sections**: 2-3 blank lines
- **Before/after code blocks**: 1 blank line
- **Before/after tables**: 1 blank line
- **Before/after blockquotes**: 1 blank line


## Color Scheme

The markdown is styled with a dark theme:

- **Headings**: H1 (bee-500), H2 (bee-400), H3+ (gray-300)
- **Links**: Blue-400 (hover: Blue-300)
- **Code**: Yellow-300 on gray-800 background
- **Tables**: Gray-800 headers, striped rows
- **Blockquotes**: Blue-500 border, gray-800 background


---

## Testing Your Formatting

Try asking the chatbot questions and observe how it formats the responses using these markdown features. The system is designed to automatically apply proper formatting based on the content type and structure.
