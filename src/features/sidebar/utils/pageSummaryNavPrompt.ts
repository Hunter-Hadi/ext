
export const getSummaryPagePrompt = (key: 'all' | 'summary' | 'keyTakeaways' = 'all') => {
    let defPrompt = `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects.
    The context text is sourced from the main content of the webpage at {{CURRENT_WEBPAGE_URL}}
  
    `
    switch (key) {
        case 'all':
            defPrompt += `Output a summary and a list of key takeaways respectively.
        The summary should be a one-liner in at most 100 words.
        The key takeaways should be in up to seven bulletpoints, the fewer the better.
        ---
        Use the following format:
        #### TL;DR
        <summary of the text>
        
        #### Key Takeaways
        <list of key takeaways>`
            break

        case 'summary':
            defPrompt += `Output a summary.
            The summary should be a maximum of 100 words per line.
            ---
            Use the following format:
            #### TL;DR
            <summary of the text>`
            break
        case 'keyTakeaways':
            defPrompt += `Output a list of key points.
            Output Text.
            The key harvest should be at a maximum of seven cowshed points, the less the better.
            ---
            Use the following format:
            #### Key Takeaways
            <list of key takeaways>`
            break
    }
    return defPrompt
}
export const getSummaryPdfPrompt = (key: 'all' | 'summary' | 'keyTakeaways' = 'all') => {
    let defPrompt = `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects. 
  The context text originates from the main content of a PDF is in the system prompt.
  `
    switch (key) {
        case 'all':
            defPrompt += `Output a summary and a list of key takeaways respectively.
        The summary should be a one-liner in at most 100 words.
        The key takeaways should be in up to seven bulletpoints, the fewer the better.
        ---
        Use the following format:
        #### TL;DR
        <summary of the text>
        
        #### Key Takeaways
        <list of key takeaways>`
            break
        case 'summary':
            defPrompt += `Output a summary.
            The summary should be a maximum of 100 words per line.
            ---
            Use the following format:

            #### TL;DR
            <summary of the text>`
            break
        case 'keyTakeaways':
            defPrompt += `Output a list of key points.
            The key harvest should be at a maximum of seven cowshed points, the less the better.
            ---
            Use the following format:

            #### Key Takeaways
            <list of key takeaways>`
            break
    }
    return defPrompt
}
export const getSummaryEmailPrompt = (key: 'all' | 'summary' | 'keyTakeaways' | 'actions' = 'all') => {
    let defPrompt = `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways and action items of the context text delimited by triple backticks in all relevant aspects. 
The context text comprises email messages from an email thread you received or sent on {{CURRENT_WEBSITE_DOMAIN}}.`
    switch (key) {
        case 'all':
            defPrompt += `Output a summary, a list of key takeaways, and a list of action items respectively.
            The summary should be a one-liner in at most 100 words. 
            The key takeaways should be in up to seven bulletpoints, the fewer the better.
            When extracting the action items, identify only the action items that need the reader to take action, and exclude action items requiring action from anyone other than the reader. Output the action items in bulletpoints, and pick a good matching emoji for every bullet point.
            
            ---
            
            Use the following format:
            #### TL;DR
            <summary of the text>
            
            #### Key Takeaways
            <list of key takeaways>
            
            #### Action Items
            <list of action items>`
            break
        case 'summary':
            defPrompt += `Output a summary.
            The summary should be a maximum of 100 words per line.
            ---
            Use the following format:
            #### TL;DR
        <summary of the text>`
            break
        case 'keyTakeaways':
            defPrompt += `Output a list of key points.
            The key harvest should be at a maximum of seven cowshed points, the less the better.
            ---
            Use the following format:
            #### Key Takeaways
        <list of key takeaways>`
            break
        case 'actions':
            defPrompt += `Output a list of action items.
            When extracting action items, only recognize the action items that require the reader to perform the operation, and exclude the action items that need to be performed from anyone outside the reader. Output action items in bullet points and select a matching emoji for each bullet point.
            ---
            Use the following format:
            #### Action Items
            <list of action items>`
            break

    }
    return defPrompt
}
export const getSummaryYoutubeVideoPrompt = (key: 'all' | 'transcript' | 'commit' = 'all') => {
    let defPrompt = `Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects. 
    The context text is the information and/or transcript of a video from {{CURRENT_WEBPAGE_URL}}.
`
    switch (key) {
        case 'all':
            defPrompt += `Output a summary and a list of key takeaways respectively.
        The summary should be a one-liner in at most 100 words.
        The key takeaways should be in up to seven bulletpoints, the fewer the better.
        ---
        Use the following format:
        #### TL;DR
        <summary of the text>
        
        #### Key Takeaways
        <list of key takeaways>`
            break
        case 'commit':
            defPrompt += `Output comment list.
            The format of the comment should be as follows.
            1.Name: Comment
            2.Name: Comment
            ---
            Use the following format:
            #### Top Comment

            Here is a summary of the comments, brief and no more than 50 words long

            Display the "comment list" here and output it in regular font, with a limit of 15 comments per list`
            break
        case 'transcript':
            defPrompt = `
            from {{page}}

I want you to only answer in {{language}}. Your goal is to divide the chunk of the transcript into sections of information with a common theme and note the beginning timestamp of each section.
Each information block should not be less than 2 minutes, contains the timestamp of the beginning of the section, a textual description of the main content of the entire section, and 1 to 3 bullet points that elaborate on the main ideas of the entire section. Do not use words like "emphasis" to go into the exact detail and terminology.
Your response must be concise, informative and easy to read & understand.
Use the specified format:

- [Section beginning Timestamp URL] [Section emoji] [Section key takeaway in {{english}}]

  - Section key takeaway,

  - [Use as many bullet points for section key takeaways as you need].


Follow the required format, don't write anything extra, avoid generic phrases, and don't repeat my task.  focus on practical implementations. include the specific topics discussed, the advice given to students, and any specific tools or methods recommended for use in the course.
The timestamp should be displayed in tag URL format. The URL text indicates that the address is linked to a specific time in the video and is the current page open, for example:
- [00:00]({{CURRENT_WEBPAGE_URL}}&t=0s)  ...
- [01:18]({{CURRENT_WEBPAGE_URL}}&t=78s)  ...
- [03:37]({{CURRENT_WEBPAGE_URL}}&t=217s)  ...

Keep emoji relevant and unique to each section. Do not use the same emoji for every section. Do not render brackets. Do not prepend takeaway with "Key takeaway".

[VIDEO TRANSCRIPT CHUNK]:
{{chunk}}`
            break
    }
    return defPrompt
}
// 对象类型
interface SummaryGetPromptObject {
    PAGE_SUMMARY: (key?: 'all' | 'summary' | 'keyTakeaways') => string;
    PDF_CRX_SUMMARY: (key?: 'all' | 'summary' | 'keyTakeaways') => string;
    YOUTUBE_VIDEO_SUMMARY: (key?: 'all' | 'transcript' | 'commit') => string;
    DEFAULT_EMAIL_SUMMARY: (key?: 'all' | 'summary' | 'keyTakeaways' | 'actions') => string;
}

// 定义的对象符合我们之前定义的接口类型
export const summaryGetPromptObj: SummaryGetPromptObject = {
    'PAGE_SUMMARY': getSummaryPagePrompt,
    'PDF_CRX_SUMMARY': getSummaryPdfPrompt,
    'YOUTUBE_VIDEO_SUMMARY': getSummaryYoutubeVideoPrompt,
    'DEFAULT_EMAIL_SUMMARY': getSummaryEmailPrompt,
}
