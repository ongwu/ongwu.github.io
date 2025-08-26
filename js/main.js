// 导航栏滚动效果
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    // 简化实现，只在滚动时添加/移除scrolled类
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 初始检查
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }
}

// 主题管理器
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // 应用保存的主题
        this.applyTheme(this.currentTheme);
        
        // 绑定切换事件
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
}

// 搜索管理器
class SearchManager {
    constructor() {
        this.searchBtn = document.getElementById('searchBtn');
        this.searchModal = document.getElementById('searchModal');
        this.searchOverlay = document.getElementById('searchOverlay');
        this.searchClose = document.getElementById('searchClose');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.searchNoResults = document.getElementById('searchNoResults');
        this.posts = [];
        this.searchHistory = [];
        this.init();
    }

    init() {
        this.loadPosts();
        this.loadSearchHistory();
        this.bindEvents();
        this.bindKeyboardEvents();
    }

    loadPosts() {
        // 从 search.xml 加载文章数据
        fetch('/search.xml')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, 'text/xml');
                const entries = xmlDoc.getElementsByTagName('entry');
                
                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const title = entry.getElementsByTagName('title')[0].textContent;
                    const content = entry.getElementsByTagName('content')[0].textContent;
                    const url = entry.getElementsByTagName('url')[0].textContent;
                    
                    this.posts.push({
                        title: title,
                        description: this.getExcerpt(content),
                        content: content,
                        url: url,
                        type: this.getPostTypeFromUrl(url)
                    });
                }
            })
            .catch(error => {
                console.error('无法加载搜索数据:', error);
                // 回退到原始方法
                const postElements = document.querySelectorAll('.project-card, .tech-item, .tutorial-item');
                postElements.forEach(element => {
                    const titleElement = element.querySelector('h3 a, .tech-title a, .tutorial-title a');
                    const descElement = element.querySelector('.project-desc, .tech-desc, .tutorial-desc');
                    
                    if (titleElement) {
                        this.posts.push({
                            title: titleElement.textContent,
                            description: descElement ? descElement.textContent : '',
                            content: element.textContent,
                            url: titleElement.getAttribute('href'),
                            type: this.getPostTypeFromUrl(titleElement.getAttribute('href'))
                        });
                    }
                });
            });
    }
    
    getPostTypeFromUrl(url) {
        if (url.includes('/projects/')) return 'project';
        if (url.includes('/tech/')) return 'tech';
        if (url.includes('/tutorial/')) return 'tutorial';
        return 'post';
    }
    
    getExcerpt(content, length = 100) {
        // 移除HTML标签
        const text = content.replace(/<[^>]+>/g, '');
        // 截取指定长度
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
    
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('searchHistory');
            if (history) {
                this.searchHistory = JSON.parse(history);
            }
        } catch (error) {
            console.warn('无法加载搜索历史:', error);
        }
    }
    
    saveSearchHistory(query) {
        
        // 移除重复项并添加到开头
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        this.searchHistory.unshift(query);
        
        // 限制历史记录数量
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
        
        try {
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('无法保存搜索历史:', error);
        }
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.openSearch());
        this.searchClose.addEventListener('click', () => this.closeSearch());
        this.searchOverlay.addEventListener('click', () => this.closeSearch());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // 绑定搜索建议标签点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-tag')) {
                const tag = e.target.getAttribute('data-tag');
                this.searchInput.value = tag;
                // 跳转到搜索结果页面
                this.performSearch(tag);
            }
        });
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            }
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                this.openSearch();
            }
            if (e.key === 'Enter' && this.searchModal.classList.contains('active')) {
                this.performSearch();
            }
        });
    }

    openSearch() {
        this.searchModal.classList.add('active');
        this.searchInput.focus();
        document.body.style.overflow = 'hidden';
        
        // 显示搜索建议
        this.showSuggestions();
        
        // CSS 已经处理了 .search-modal 和 .search-container 的淡入动画
        // 移除 setTimeout 中的 transform 和 opacity 调整，让 CSS 负责
    }

    closeSearch() {
        // CSS 已经处理了 .search-modal 和 .search-container 的淡出动画
        // 等待 CSS 动画完成后再移除 active 类和清理内容
        setTimeout(() => {
            this.searchModal.classList.remove('active');
            this.searchInput.value = '';
            this.searchResults.innerHTML = '';
            this.searchNoResults.style.display = 'none';
            this.searchSuggestions.style.display = 'block';
            document.body.style.overflow = '';
        }, 300);
    }

    showSuggestions() {
        this.searchSuggestions.style.display = 'block';
        this.searchResults.innerHTML = '';
        this.searchNoResults.style.display = 'none';
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.showSuggestions();
            return;
        }

        const results = this.searchPosts(query);
        this.displayResults(results, query);
    }

    performSearch(customQuery) {
        const query = customQuery || this.searchInput.value.trim();
        if (query) {
            this.saveSearchHistory(query);
            // 跳转到搜索结果页面
            window.location.href = `/search/?q=${encodeURIComponent(query)}`;
        }
    }

    searchPosts(query) {
        if (!query || query.length < 2) {
            return [];
        }
        
        query = query.toLowerCase();
        
        return this.posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(query);
            const contentMatch = post.content.toLowerCase().includes(query);
            return titleMatch || contentMatch;
        });
    }
    
    displayResults(results, query) {
        this.searchResults.innerHTML = '';
        this.searchSuggestions.style.display = 'none';
        
        if (results.length === 0) {
            this.searchNoResults.style.display = 'flex';
            return;
        }
        
        this.searchNoResults.style.display = 'none';
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            const typeLabel = this.getTypeLabel(result.type);
            
            resultItem.innerHTML = `
                <a href="${result.url}" class="search-result-link">
                    <div class="search-result-type">${typeLabel}</div>
                    <div class="search-result-content">
                        <h4 class="search-result-title">${this.highlightText(result.title, query)}</h4>
                        <p class="search-result-desc">${this.highlightText(result.description, query)}</p>
                    </div>
                </a>
            `;
            
            this.searchResults.appendChild(resultItem);
        });
    }
    
    getTypeLabel(type) {
        switch (type) {
            case 'project': return '项目';
            case 'tech': return '技术';
            case 'tutorial': return '教程';
            default: return '文章';
        }
    }
    
    highlightText(text, query) {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
}

// 留言板功能
class GuestbookManager {
    constructor() {
        this.comments = [];
        this.currentPage = 1;
        this.commentsPerPage = 20;
        this.currentCaptcha = '';
        this.replyCaptcha = '';
        this.replyingTo = null;
        
        this.init();
    }

    init() {
        // 测试localStorage是否可用
        this.testLocalStorage();
        
        this.loadComments();
        this.generateCaptcha();
        this.bindEvents();
        this.renderComments();
        this.renderPagination();
    }

    // 测试localStorage是否可用
    testLocalStorage() {
        try {
            const testKey = 'testLocalStorage';
            localStorage.setItem(testKey, 'test');
            const testValue = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (testValue === 'test') {
                console.log('localStorage工作正常');
            } else {
                console.error('localStorage测试失败');
            }
        } catch (error) {
            console.error('localStorage不可用:', error);
        }
    }

    // 生成验证码
    generateCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.currentCaptcha = result;
        const captchaText = document.getElementById('captchaText');
        if (captchaText) {
            captchaText.textContent = result;
        }
    }

    // 生成回复验证码
    generateReplyCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.replyCaptcha = result;
        const replyCaptchaText = document.getElementById('replyCaptchaText');
        if (replyCaptchaText) {
            replyCaptchaText.textContent = result;
        }
    }

    // 绑定事件
    bindEvents() {
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitComment();
            });
        }

        const replyForm = document.getElementById('replyForm');
        if (replyForm) {
            replyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReply();
            });
        }

        const refreshCaptcha = document.getElementById('refreshCaptcha');
        if (refreshCaptcha) {
            refreshCaptcha.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateCaptcha();
            });
        }

        const refreshReplyCaptcha = document.getElementById('refreshReplyCaptcha');
        if (refreshReplyCaptcha) {
            refreshReplyCaptcha.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateReplyCaptcha();
            });
        }

        const sortOrder = document.getElementById('sortOrder');
        if (sortOrder) {
            sortOrder.addEventListener('change', (e) => {
                this.sortComments(e.target.value);
                this.renderComments();
                this.renderPagination();
            });
        }

        const replyClose = document.getElementById('replyClose');
        if (replyClose) {
            replyClose.addEventListener('click', () => {
                this.closeReplyModal();
            });
        }

        const cancelReply = document.getElementById('cancelReply');
        if (cancelReply) {
            cancelReply.addEventListener('click', () => {
                this.closeReplyModal();
            });
        }

        const replyOverlay = document.getElementById('replyOverlay');
        if (replyOverlay) {
            replyOverlay.addEventListener('click', () => {
                this.closeReplyModal();
            });
        }

        const replyModal = document.getElementById('replyModal');
        if (replyModal) {
            replyModal.addEventListener('click', (e) => {
                if (e.target.id === 'replyModal') {
                    this.closeReplyModal();
                }
            });
        }
    }

    // 加载评论数据
    loadComments() {
        const savedComments = localStorage.getItem('guestbookComments');
        if (savedComments) {
            this.comments = JSON.parse(savedComments);
        } else {
            // 示例评论数据
            this.comments = [
                {
                    id: 1,
                    username: '小明',
                    content: '这个网站设计得很棒！简洁大气，我很喜欢这种风格。',
                    date: new Date('2024-01-15T10:30:00'),
                    replies: [
                        {
                            id: 1,
                            username: '网站主人',
                            content: '谢谢小明的支持！我会继续努力的。',
                            date: new Date('2024-01-15T11:00:00')
                        }
                    ]
                },
                {
                    id: 2,
                    username: '技术达人',
                    content: '技术文章写得很好，对我帮助很大。希望能多分享一些实战经验。',
                    date: new Date('2024-01-14T15:20:00'),
                    replies: []
                },
                {
                    id: 3,
                    username: '设计爱好者',
                    content: 'UI设计很精美，配色和布局都很协调。请问是用什么技术栈开发的？',
                    date: new Date('2024-01-13T09:15:00'),
                    replies: [
                        {
                            id: 2,
                            username: '网站主人',
                            content: '谢谢关注！这个网站是用Hexo静态博客框架开发的，主题是自制的。',
                            date: new Date('2024-01-13T10:00:00')
                        }
                    ]
                }
            ];
            this.saveComments();
        }
    }

    // 保存评论到localStorage
    saveComments() {
        try {
            localStorage.setItem('guestbookComments', JSON.stringify(this.comments));
        } catch (error) {
            console.error('无法保存评论:', error);
        }
    }

    // 提交评论
    submitComment() {
        const username = document.getElementById('username').value.trim();
        const content = document.getElementById('comment').value.trim();
        const captcha = document.getElementById('captcha').value.trim();

        if (!username || !content || !captcha) {
            alert('请填写所有必填字段');
            return;
        }

        if (captcha.toUpperCase() !== this.currentCaptcha.toUpperCase()) {
            alert('验证码错误，请重新输入');
            this.generateCaptcha();
            document.getElementById('captcha').value = '';
            return;
        }

        const newComment = {
            id: Date.now(),
            username: username,
            content: content,
            date: new Date(),
            replies: []
        };

        this.comments.unshift(newComment);
        this.saveComments();
        this.renderComments();
        this.renderPagination();

        // 清空表单
        document.getElementById('username').value = '';
        document.getElementById('comment').value = '';
        document.getElementById('captcha').value = '';
        this.generateCaptcha();
    }

    // 提交回复
    submitReply() {
        const username = document.getElementById('replyUsername').value.trim();
        const content = document.getElementById('replyContent').value.trim();
        const captcha = document.getElementById('replyCaptcha').value.trim();

        if (!username || !content || !captcha) {
            alert('请填写所有必填字段');
            return;
        }

        if (captcha.toUpperCase() !== this.replyCaptcha.toUpperCase()) {
            alert('验证码错误，请重新输入');
            this.generateReplyCaptcha();
            document.getElementById('replyCaptcha').value = '';
            return;
        }

        if (!this.replyingTo) {
            alert('回复目标不存在');
            this.closeReplyModal();
            return;
        }

        const newReply = {
            id: Date.now(),
            username: username,
            content: content,
            date: new Date()
        };

        const commentIndex = this.comments.findIndex(c => c.id === this.replyingTo.id);
        if (commentIndex !== -1) {
            this.comments[commentIndex].replies.push(newReply);
            this.saveComments();
            this.renderComments();
            this.closeReplyModal();
        }
    }

    // 打开回复模态框
    openReplyModal(comment) {
        if (!comment || !comment.id) {
            return;
        }

        this.replyingTo = { ...comment };
        document.getElementById('replyModal').classList.add('active');
        document.getElementById('replyUsername').value = '';
        document.getElementById('replyContent').value = '';
        document.getElementById('replyCaptcha').value = '';
        this.generateReplyCaptcha();
    }

    // 关闭回复模态框
    closeReplyModal() {
        document.getElementById('replyModal').classList.remove('active');
        this.replyingTo = null;
    }

    // 排序评论
    sortComments(order) {
        if (order === 'newest') {
            this.comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            this.comments.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
    }

    // 渲染评论列表
    renderComments() {
        const startIndex = (this.currentPage - 1) * this.commentsPerPage;
        const endIndex = startIndex + this.commentsPerPage;
        const pageComments = this.comments.slice(startIndex, endIndex);
        const commentsList = document.getElementById('commentsList');
        
        if (!commentsList) return;
        
        commentsList.innerHTML = '';
        
        if (pageComments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">还没有留言，快来发表第一条留言吧！</div>';
            return;
        }
        
        pageComments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
        
        const totalComments = document.getElementById('totalComments');
        if (totalComments) {
            totalComments.textContent = this.comments.length;
        }
    }

    // 创建评论元素
    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${this.escapeHtml(comment.username)}</span>
                <span class="comment-content">${this.escapeHtml(comment.content)}</span>
                <span class="comment-date">${this.formatDate(comment.date)}</span>
            </div>
            <div class="comment-actions">
                <button class="reply-btn" data-id="${comment.id}">回复</button>
            </div>
            ${comment.replies.length > 0 ? this.createRepliesSection(comment.replies) : ''}
        `;
        
        // 绑定回复按钮事件
        const replyBtn = commentDiv.querySelector('.reply-btn');
        replyBtn.addEventListener('click', () => {
            this.openReplyModal(comment);
        });
        
        return commentDiv;
    }

    // 创建回复区域
    createRepliesSection(replies) {
        return `
            <div class="comment-replies">
                ${replies.map(reply => `
                    <div class="reply-item">
                        <div class="reply-header">
                            <span class="reply-author">${this.escapeHtml(reply.username)}</span>
                            <span class="reply-date">${this.formatDate(reply.date)}</span>
                        </div>
                        <div class="reply-content">${this.escapeHtml(reply.content)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 渲染分页
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.comments.length / this.commentsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <button class="page-btn prev-page ${this.currentPage === 1 ? 'disabled' : ''}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                </svg>
                上一页
            </button>
        `;
        
        // 页码按钮
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn page-number ${i === this.currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // 下一页按钮
        paginationHTML += `
            <button class="page-btn next-page ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                下一页
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                </svg>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // 绑定分页事件
        const pageButtons = pagination.querySelectorAll('.page-number');
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.getAttribute('data-page'));
                this.renderComments();
                this.renderPagination();
                document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        const prevButton = pagination.querySelector('.prev-page:not(.disabled)');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.currentPage--;
                this.renderComments();
                this.renderPagination();
                document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        const nextButton = pagination.querySelector('.next-page:not(.disabled)');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.currentPage++;
                this.renderComments();
                this.renderPagination();
                document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // 格式化日期
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // HTML转义
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// 文章评论系统
class PostCommentManager {
    constructor() {
        this.comments = [];
        this.currentPage = 1;
        this.commentsPerPage = 10;
        this.currentCaptcha = '';
        this.replyingTo = null;
        this.commentAPI = new CommentAPI();
        
        this.init();
    }

    async init() {
        await this.loadComments();
        this.generateCaptcha();
        this.bindEvents();
        this.renderComments();
        this.renderPagination();
    }

    // 生成验证码
    generateCaptcha() {
        const chars = 'ABCDEFGHIJKMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.currentCaptcha = result;
        const captchaText = document.getElementById('captchaText');
        if (captchaText) {
            captchaText.textContent = result;
        }
    }

    // 绑定事件
    bindEvents() {
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitComment();
            });
        }

        const refreshCaptcha = document.getElementById('refreshCaptcha');
        if (refreshCaptcha) {
            refreshCaptcha.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateCaptcha();
            });
        }

        const sortOrder = document.getElementById('sortOrder');
        if (sortOrder) {
            sortOrder.addEventListener('change', (e) => {
                this.sortComments(e.target.value);
                this.renderComments();
            });
        }
    }

    // 加载评论
    async loadComments() {
        const postId = window.location.pathname;
        
        try {
            // 首先尝试从 JSON 文件加载评论
            const jsonComments = await this.commentAPI.getComments(postId);
            this.comments = jsonComments;
            
            // 同步到 localStorage
            this.commentAPI.saveCommentsToLocalStorage(postId, this.comments);
        } catch (error) {
            console.log('从 JSON 文件加载评论失败，使用 localStorage:', error);
            // 如果失败，从 localStorage 加载
            const savedComments = localStorage.getItem(`postComments_${postId}`);
            if (savedComments) {
                this.comments = JSON.parse(savedComments);
            } else {
                this.comments = [];
            }
        }
    }

    // 保存评论
    async saveComments() {
        const postId = window.location.pathname;
        
        try {
            // 尝试保存到 JSON 文件
            await this.commentAPI.saveComments(postId, this.comments);
        } catch (error) {
            console.log('保存到 JSON 文件失败，使用 localStorage:', error);
        }
        
        // 同时保存到 localStorage 作为备选
        localStorage.setItem(`postComments_${postId}`, JSON.stringify(this.comments));
    }

    // 提交评论
    submitComment() {
        const username = document.getElementById('username').value.trim();
        const content = document.getElementById('comment').value.trim();
        const captchaInput = document.getElementById('captchaInput').value.trim();

        if (!username || !content || !captchaInput) {
            alert('请填写所有必填字段');
            return;
        }

        if (captchaInput.toUpperCase() !== this.currentCaptcha) {
            alert('验证码错误，请重新输入');
            this.generateCaptcha();
            document.getElementById('captchaInput').value = '';
            return;
        }

        const newComment = {
            id: Date.now(),
            username: username,
            content: content,
            date: new Date().toISOString(),
            replies: []
        };

        this.comments.unshift(newComment);
        this.saveComments();
        this.renderComments();
        this.renderPagination();

        // 清空表单
        document.getElementById('username').value = '';
        document.getElementById('comment').value = '';
        document.getElementById('captchaInput').value = '';
        this.generateCaptcha();

        alert('评论发表成功！');
    }

    // 排序评论
    sortComments(order) {
        if (order === 'newest') {
            this.comments.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            this.comments.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
    }

    // 渲染评论
    renderComments() {
        const startIndex = (this.currentPage - 1) * this.commentsPerPage;
        const endIndex = startIndex + this.commentsPerPage;
        const pageComments = this.comments.slice(startIndex, endIndex);
        const commentsList = document.getElementById('commentsList');

        if (!commentsList) return;

        commentsList.innerHTML = '';

        if (pageComments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">还没有评论，快来发表第一条评论吧！</div>';
        } else {
            pageComments.forEach(comment => {
                const commentElement = this.createCommentElement(comment);
                commentsList.appendChild(commentElement);
            });
        }

        const totalComments = document.getElementById('totalComments');
        if (totalComments) {
            totalComments.textContent = this.comments.length;
        }
    }

    // 创建评论元素
    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${this.escapeHtml(comment.username)}</span>
                <span class="comment-content">${this.escapeHtml(comment.content)}</span>
                <span class="comment-date">${this.formatDate(comment.date)}</span>
            </div>
            ${comment.replies.length > 0 ? this.createRepliesSection(comment.replies) : ''}
        `;

        return commentDiv;
    }

    // 创建回复区域
    createRepliesSection(replies) {
        let repliesHTML = '<div class="comment-replies">';
        replies.forEach(reply => {
            repliesHTML += `
                <div class="reply-item">
                    <div class="reply-header">
                        <span class="reply-author">${this.escapeHtml(reply.username)}</span>
                        <span class="reply-date">${this.formatDate(reply.date)}</span>
                    </div>
                    <div class="reply-content">${this.escapeHtml(reply.content)}</div>
                </div>
            `;
        });
        repliesHTML += '</div>';
        return repliesHTML;
    }

    // 渲染分页
    renderPagination() {
        const pagination = document.getElementById('commentsPagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.comments.length / this.commentsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <button class="page-btn prev-page ${this.currentPage === 1 ? 'disabled' : ''}" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                </svg>
                上一页
            </button>
        `;

        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="page-btn page-number ${i === this.currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // 下一页按钮
        paginationHTML += `
            <button class="page-btn next-page ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                下一页
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                </svg>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        
        // 绑定分页事件
        const pageButtons = pagination.querySelectorAll('.page-number');
        pageButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentPage = parseInt(button.getAttribute('data-page'));
                this.renderComments();
                this.renderPagination();
                document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        const prevButton = pagination.querySelector('.prev-page:not(.disabled)');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                this.currentPage--;
                this.renderComments();
                this.renderPagination();
                document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        const nextButton = pagination.querySelector('.next-page:not(.disabled)');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.currentPage++;
                this.renderComments();
                this.renderPagination();
                document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    // 格式化日期
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    // HTML转义
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏滚动效果
    initHeaderScroll();
    
    // 初始化主题切换功能
    new ThemeManager();
    
    // 初始化搜索功能
    if (document.getElementById('searchBtn')) {
        new SearchManager();
    }
    
    // 初始化留言板功能
    if (document.getElementById('commentForm')) {
        new GuestbookManager();
    }
    
    // 初始化文章评论功能
    if (document.querySelector('.comments-section')) {
        new PostCommentManager();
    }
});