import React from 'react'
import {css} from '@emotion/react'
import {MoonLoader} from 'react-spinners'

const style = {
    wrapper : `text-white px-8 h-56 w-82 flex flex-col justify-center items-center`,
    title : `font-semibold text-base mt-8 mb-6`
}
const cssOverride = css`
    display : block;
    margin : 0 auto;
    border-color : white; 
`;
const TransactionLoader = () => {
  return (
    <div className={style.wrapper}>
        <MoonLoader color={`#ffffff`} loading={true} css={cssOverride} size={75} />
        <div className={style.title}>Transaction in progress ...</div>
    </div>
  )
}

export default TransactionLoader