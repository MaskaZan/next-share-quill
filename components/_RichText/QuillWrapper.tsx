import ReactQuill, { ComponentProps } from 'react-quill'

import { MutableRefObject } from 'react'

const QuillWrapper = (props: ComponentProps & { innerRef: MutableRefObject<ReactQuill> }) => {
  const { innerRef, ...quillProps } = props

  console.log('innerRef', innerRef)

  return (
    <ReactQuill
      {...quillProps}
      ref={innerRef}
    />
  )
}

export default QuillWrapper