/**
 * 各种不同的按钮设置
 * 数据结构:
 * {
 *   textSelectPopup:{
 *     visibility: {
 *       whitelist: ['*'],
 *       blacklist: []
 *       // 优先级: whitelist > blacklist
 *     },
 *     prompts: [
 *       {
 *         ..., // prompts的数据结构
 *         whitelist: ['*'],
 *         blacklist: [],
 *       }
 *     ]
 *   },
 *   gmailButton: {
 *     visibility: {
 *         whitelist: ['mail.google.com'],
 *         blacklist: []
 *     }
 *   }
 * }
 */

export const getDomainSettings = async () => {}
