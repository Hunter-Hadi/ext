import { Stack, styled } from "@mui/material"
import React, { FC, useEffect, useRef } from "react"
import throttle from 'lodash-es/throttle';
interface IProps {
    children: React.ReactNode
    height: string
    update: string
}
const beforeCss = {
    content: "''",
    position: 'absolute',
    left: 0,
    right: 0,
    height: '5px',
    pointerEvents: 'none', // 使得伪元素不影响其他元素的交互
    zIndex: 9999,
}
const StackWrap = styled(Stack)({
    position: 'relative',
    '&.shadow-bottom::before': {
        ...beforeCss,
        bottom: 0, // 根据你的需求调整
        background: 'linear-gradient(to top, rgba(128, 128, 128, 0.5), transparent)', // 从底部到顶部的渐变
    },
    '&.shadow-top::before': {
        ...beforeCss,
        top: 0, // 根据你的需求调整
        background: 'linear-gradient(to bottom, rgba(128, 128, 128, 0.5), transparent)', // 从顶部到底部的渐变
    }
})
export const HeightUpdateScrolling: FC<IProps> = ({ children, height, update }) => {
    const scrollTopRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [update])

    useEffect(() => {
        const handleScroll = throttle(() => {
            if (scrollRef.current && scrollTopRef.current) {
                const distanceFromBottom = scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight;
                if (distanceFromBottom <= 16) {
                    // 滚动到底部
                    scrollTopRef.current.classList.add('shadow-top');
                    scrollTopRef.current.classList.remove('shadow-bottom');
                } else {
                    scrollTopRef.current.classList.add('shadow-bottom');
                    scrollTopRef.current.classList.remove('shadow-top');
                }
            }
        }, 100); // 100ms的延迟

        scrollRef.current?.addEventListener('scroll', handleScroll);

        return () => {
            scrollRef.current?.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return <StackWrap ref={scrollTopRef}>
        <div ref={scrollRef} style={{ maxHeight: height, overflowY: 'auto' }}>
            {children}
        </div>
    </StackWrap>
}