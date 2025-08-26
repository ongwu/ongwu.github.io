// 评论 API 管理器
class CommentAPI {
    constructor() {
        this.baseUrl = window.location.origin;
    }

    // 获取评论
    async getComments(pageId) {
        try {
            const response = await fetch(`${this.baseUrl}/comments/${pageId}_comments.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.comments || [];
        } catch (error) {
            console.error('获取评论失败:', error);
            // 如果获取失败，尝试从 localStorage 读取
            return this.getCommentsFromLocalStorage(pageId);
        }
    }

    // 保存评论到 JSON 文件（通过模拟 POST 请求）
    async saveComments(pageId, comments) {
        try {
            // 由于 Hexo 是静态站点，我们需要使用其他方式保存
            // 这里我们使用 localStorage 作为备选方案
            this.saveCommentsToLocalStorage(pageId, comments);
            
            // 尝试使用 GitHub API 或其他服务来保存评论
            // 这里可以集成 GitHub Gist、LeanCloud 等服务
            
            return true;
        } catch (error) {
            console.error('保存评论失败:', error);
            // 保存到 localStorage 作为备选
            this.saveCommentsToLocalStorage(pageId, comments);
            return false;
        }
    }

    // 从 localStorage 获取评论
    getCommentsFromLocalStorage(pageId) {
        const savedComments = localStorage.getItem(`postComments_${pageId}`);
        if (savedComments) {
            return JSON.parse(savedComments);
        }
        return [];
    }

    // 保存评论到 localStorage
    saveCommentsToLocalStorage(pageId, comments) {
        localStorage.setItem(`postComments_${pageId}`, JSON.stringify(comments));
    }

    // 同步评论（从 JSON 文件同步到 localStorage）
    async syncComments(pageId) {
        try {
            const jsonComments = await this.getComments(pageId);
            const localComments = this.getCommentsFromLocalStorage(pageId);
            
            // 合并评论，避免重复
            const mergedComments = this.mergeComments(jsonComments, localComments);
            
            // 保存合并后的评论
            this.saveCommentsToLocalStorage(pageId, mergedComments);
            
            return mergedComments;
        } catch (error) {
            console.error('同步评论失败:', error);
            return this.getCommentsFromLocalStorage(pageId);
        }
    }

    // 合并评论，避免重复
    mergeComments(jsonComments, localComments) {
        const allComments = [...jsonComments];
        
        localComments.forEach(localComment => {
            const exists = allComments.some(jsonComment => 
                jsonComment.id === localComment.id
            );
            if (!exists) {
                allComments.push(localComment);
            }
        });
        
        // 按时间排序
        return allComments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

// 导出 CommentAPI 类
window.CommentAPI = CommentAPI;
