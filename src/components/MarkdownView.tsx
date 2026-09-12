import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import CodeBlock from './CodeBlock';
export default function MarkdownView({markdown}:{markdown:string}){
 return <div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm,remarkMath]} rehypePlugins={[rehypeKatex]} components={{
  code({className,children,...props}){const match=/language-(\w+)/.exec(className||''); const code=String(children).replace(/\n$/,''); if(match)return <CodeBlock code={code} language={match[1]}/>; return <code className={className} {...props}>{children}</code>}
 }}>{markdown}</ReactMarkdown></div>
}
