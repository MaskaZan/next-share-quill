import { MutableRefObject, forwardRef } from 'react'
import ReactQuill, { ComponentProps } from 'react-quill'

import dynamic from 'next/dynamic'

export default dynamic(async () => {
  const { default: QuillWrapper } = await import('./QuillWrapper')

  const DynamicQuill = forwardRef<ReactQuill, ComponentProps>((
    props: ComponentProps,
    ref: MutableRefObject<ReactQuill>
  ) => (
    <QuillWrapper
      innerRef={ref}
      {...props}
    />
  ))

  return DynamicQuill
}, {
  ssr: false
})