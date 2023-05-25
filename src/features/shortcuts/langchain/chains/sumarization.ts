/**
 * @inheritDoc - https://js.langchain.com/docs/modules/chains/other_chains/summarization
 * @inheritDoc - https://js.langchain.com/docs/modules/chains/index_related_chains/document_qa
 */
// import { OpenAI } from 'langchain/llms/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
// import { loadSummarizationChain } from 'langchain/chains'

export const langChainSummarization = async (input: string) => {
  try {
    return input
    // In this example, we use a `MapReduceDocumentsChain` specifically prompted to summarize a set of documents.
    // const text = input
    // const model = new OpenAI({ temperature: 0 })
    // const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
    // const docs = await textSplitter.createDocuments([text])
    // This convenience function creates a document chain prompted to summarize a set of documents.
    // StuffDocumentsChain: 这条链是三者中最直接的。它只是将所有输入文档作为上下文注入到提示中，并返回问题的答案。它适用于少量文档的 QA 任务。
    // MapReduceDocumentsChain：该链包含一个预处理步骤，从每个文档中选择相关部分，直到标记总数小于模型允许的最大标记数。然后它使用转换后的文档作为上下文来回答问题。它适用于较大文档的 QA 任务，可以并行运行预处理步骤，减少运行时间。
    // RefineDocumentsChain：此链逐个遍历输入文档，每次迭代更新中间答案。它使用以前版本的答案和下一个文档作为上下文。它适用于大量文档的 QA 任务。
    // const chain = loadSummarizationChain(model, { type: 'stuff' })
    // const res = await chain.call({
    //   input_documents: docs,
    // })
    // return res
  } catch (e) {
    return input
  }
}

export const fakeLangChainSummarization = async (input: string) => {
  try {
    const text = input
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
    const docs = await textSplitter.createDocuments([text])
    // This convenience function creates a document chain prompted to summarize a set of documents.
    // StuffDocumentsChain: 这条链是三者中最直接的。它只是将所有输入文档作为上下文注入到提示中，并返回问题的答案。它适用于少量文档的 QA 任务。
    // MapReduceDocumentsChain：该链包含一个预处理步骤，从每个文档中选择相关部分，直到标记总数小于模型允许的最大标记数。然后它使用转换后的文档作为上下文来回答问题。它适用于较大文档的 QA 任务，可以并行运行预处理步骤，减少运行时间。
    // RefineDocumentsChain：此链逐个遍历输入文档，每次迭代更新中间答案。它使用以前版本的答案和下一个文档作为上下文。它适用于大量文档的 QA 任务。
    // 用docs去ask chatgpt
    const template = `
    I will give you parts of text content, you will rewrite it and output that in a short summarized version of my text.
Keep the meaning the same. Ensure that the revised content has significantly fewer characters than the original text, and no more than 100 words, the fewer the better.
Only give me the output and nothing else.
Now, using the concepts above, summarize the following text. Respond in the same language variety or dialect of the following text:
"""
${docs.map((doc, index) => `[part${index}]${doc.pageContent}`).join('\n')}
"""`
    return {
      template,
      docs,
    }
  } catch (e) {
    return {
      template: input,
      docs: [],
    }
  }
}
