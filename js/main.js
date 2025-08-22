// 主要JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动
    initSmoothScroll();
    
    // 导航菜单高亮
    initNavigationHighlight();
    
    // 返回顶部按钮
    initBackToTop();
    
    // 图片懒加载
    initLazyLoading();
    
    // 移动端菜单切换
    initMobileMenu();
});

// 平滑滚动
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 导航菜单高亮
function initNavigationHighlight() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// 返回顶部按钮
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="#fff"/>
        </svg>
    `;
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #3B82F6;
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // 显示/隐藏按钮
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // 点击返回顶部
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 悬停效果
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.transform = 'scale(1.1)';
        backToTopBtn.style.background = '#2563EB';
    });
    
    backToTopBtn.addEventListener('mouseleave', () => {
        backToTopBtn.style.transform = 'scale(1)';
        backToTopBtn.style.background = '#3B82F6';
    });
}

// 图片懒加载
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // 降级处理
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// 移动端菜单切换
function initMobileMenu() {
    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav');
    
    // 创建移动端菜单按钮
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    mobileMenuBtn.style.cssText = `
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 10px;
        flex-direction: column;
        gap: 4px;
    `;
    
    const spans = mobileMenuBtn.querySelectorAll('span');
    spans.forEach(span => {
        span.style.cssText = `
            display: block;
            width: 25px;
            height: 3px;
            background: #333;
            transition: all 0.3s ease;
        `;
    });
    
    header.querySelector('.header-content').appendChild(mobileMenuBtn);
    
    // 移动端样式
    const mobileStyles = `
        @media (max-width: 768px) {
            .mobile-menu-btn {
                display: flex !important;
            }
            
            .nav {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: #fff;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                transform: translateY(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .nav.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .nav-menu {
                flex-direction: column;
                padding: 20px;
                gap: 15px;
            }
            
            .nav-item {
                width: 100%;
                text-align: center;
            }
            
            .nav-link {
                display: block;
                padding: 15px;
                border-radius: 8px;
                transition: background 0.3s ease;
            }
            
            .nav-link:hover {
                background: #f0f9ff;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = mobileStyles;
    document.head.appendChild(styleSheet);
    
    // 菜单切换
    mobileMenuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        
        // 按钮动画
        if (nav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            nav.classList.remove('active');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// 页面加载动画
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // 添加淡入动画
    const fadeElements = document.querySelectorAll('.section, .post, .project-card, .tech-item, .tutorial-item');
    fadeElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// 工具函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函数：节流
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 主题切换功能
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            this.themeToggle.querySelector('.sun-icon').style.display = 'none';
            this.themeToggle.querySelector('.moon-icon').style.display = 'block';
        } else {
            document.body.classList.remove('dark-theme');
            this.themeToggle.querySelector('.sun-icon').style.display = 'block';
            this.themeToggle.querySelector('.moon-icon').style.display = 'none';
        }
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.currentTheme = newTheme;
        this.applyTheme(newTheme);
    }
}

// 搜索功能
class SearchManager {
    constructor() {
        this.searchBtn = document.getElementById('searchBtn');
        this.searchModal = document.getElementById('searchModal');
        this.searchOverlay = document.getElementById('searchOverlay');
        this.searchClose = document.getElementById('searchClose');
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.posts = [];
        this.init();
    }

    init() {
        this.loadPosts();
        this.bindEvents();
        this.bindKeyboardEvents();
    }

    loadPosts() {
        // 获取所有文章数据
        const postElements = document.querySelectorAll('.project-card, .tech-item, .tutorial-item');
        postElements.forEach(element => {
            const titleElement = element.querySelector('h3 a, .tech-title a, .tutorial-title a');
            const descriptionElement = element.querySelector('.project-description, .tech-subtitle, .tutorial-subtitle');
            
            if (titleElement) {
                this.posts.push({
                    title: titleElement.textContent.trim(),
                    description: descriptionElement ? descriptionElement.textContent.trim() : '',
                    url: titleElement.href,
                    element: element
                });
            }
        });
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.openSearch());
        this.searchClose.addEventListener('click', () => this.closeSearch());
        this.searchOverlay.addEventListener('click', () => this.closeSearch());
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
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
        });
    }

    openSearch() {
        this.searchModal.classList.add('active');
        this.searchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    closeSearch() {
        this.searchModal.classList.remove('active');
        this.searchInput.value = '';
        this.searchResults.innerHTML = '';
        document.body.style.overflow = '';
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.searchResults.innerHTML = '';
            return;
        }

        const results = this.searchPosts(query);
        this.displayResults(results);
    }

    searchPosts(query) {
        const lowerQuery = query.toLowerCase();
        return this.posts.filter(post => {
            return post.title.toLowerCase().includes(lowerQuery) ||
                   post.description.toLowerCase().includes(lowerQuery);
        }).slice(0, 10); // 限制显示10个结果
    }

    displayResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-result-item"><p>未找到相关文章</p></div>';
            return;
        }

        this.searchResults.innerHTML = results.map(post => `
            <div class="search-result-item" onclick="window.location.href='${post.url}'">
                <div class="search-result-title">${this.highlightText(post.title, this.searchInput.value)}</div>
                <div class="search-result-excerpt">${this.highlightText(post.description, this.searchInput.value)}</div>
                <div class="search-result-meta">${post.url}</div>
            </div>
        `).join('');
    }

    highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: #fef3c7; color: #92400e; padding: 2px 4px; border-radius: 4px;">$1</mark>');
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

    // 手动测试回复功能（调试用）
    testReplyFunction() {
        console.log('=== 测试回复功能 ===');
        console.log('当前评论数量:', this.comments.length);
        console.log('当前replyingTo:', this.replyingTo);
        
        if (this.comments.length > 0) {
            const firstComment = this.comments[0];
            console.log('第一条评论:', firstComment);
            console.log('第一条评论的回复数量:', firstComment.replies.length);
            
            // 尝试添加测试回复
            const testReply = {
                id: Date.now(),
                username: '测试用户',
                content: '这是一条测试回复',
                date: new Date()
            };
            
            firstComment.replies.push(testReply);
            this.saveComments();
            
            console.log('添加测试回复后:', firstComment);
            console.log('localStorage中的数据:', localStorage.getItem('guestbookComments'));
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
        document.getElementById('captchaText').textContent = result;
    }

    // 生成回复验证码
    generateReplyCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.replyCaptcha = result;
        document.getElementById('replyCaptchaText').textContent = result;
    }

    // 绑定事件
    bindEvents() {
        // 评论表单提交
        document.getElementById('commentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });

        // 回复表单提交
        document.getElementById('replyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReply();
        });

        // 刷新验证码
        document.getElementById('refreshCaptcha').addEventListener('click', () => {
            this.generateCaptcha();
        });

        // 刷新回复验证码
        document.getElementById('refreshReplyCaptcha').addEventListener('click', () => {
            this.generateReplyCaptcha();
        });

        // 排序选择
        document.getElementById('sortOrder').addEventListener('change', (e) => {
            this.sortComments(e.target.value);
            this.renderComments();
            this.renderPagination();
        });

        // 关闭回复模态框
        document.getElementById('replyClose').addEventListener('click', () => {
            this.closeReplyModal();
        });

        document.getElementById('cancelReply').addEventListener('click', () => {
            this.closeReplyModal();
        });

        document.getElementById('replyOverlay').addEventListener('click', () => {
            this.closeReplyModal();
        });

        // 防止回复模态框意外关闭
        document.getElementById('replyModal').addEventListener('click', (e) => {
            if (e.target.id === 'replyModal') {
                this.closeReplyModal();
            }
        });
    }

    // 加载评论数据（模拟数据）
    loadComments() {
        // 从localStorage加载评论，如果没有则使用示例数据
        const savedComments = localStorage.getItem('guestbookComments');
        if (savedComments) {
            this.comments = JSON.parse(savedComments);
            console.log('从localStorage加载评论:', this.comments);
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
            console.log('使用示例评论数据:', this.comments);
        }
    }

    // 保存评论到localStorage
    saveComments() {
        localStorage.setItem('guestbookComments', JSON.stringify(this.comments));
        console.log('评论已保存到localStorage:', this.comments);
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

        if (captcha.toUpperCase() !== this.currentCaptcha) {
            alert('验证码错误，请重新输入');
            this.generateCaptcha();
            document.getElementById('captcha').value = '';
            return;
        }

        const newComment = {
            id: Date.now(),
            username: username.trim(),
            content: content.trim(),
            date: new Date(),
            replies: []
        };

        this.comments.unshift(newComment);
        this.saveComments();
        
        // 验证评论是否真的被保存了
        const savedComments = localStorage.getItem('guestbookComments');
        console.log('localStorage中的最新数据:', JSON.parse(savedComments));
        
        this.renderComments();
        this.renderPagination();

        // 清空表单
        document.getElementById('username').value = '';
        document.getElementById('comment').value = '';
        document.getElementById('captcha').value = '';
        this.generateCaptcha();

        alert('留言发表成功！');
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

        if (captcha.toUpperCase() !== this.replyCaptcha) {
            alert('验证码错误，请重新输入');
            this.generateReplyCaptcha();
            document.getElementById('replyCaptcha').value = '';
            return;
        }

        if (!this.replyingTo) {
            alert('回复失败，请重新尝试');
            return;
        }

        const newReply = {
            id: Date.now(),
            username: username.trim(),
            content: content.trim(),
            date: new Date()
        };

        // 找到对应的评论并添加回复
        const commentIndex = this.comments.findIndex(c => c.id === this.replyingTo.id);
        if (commentIndex !== -1) {
            this.comments[commentIndex].replies.push(newReply);
            this.saveComments();
            
            // 验证回复是否真的被保存了
            const savedComments = localStorage.getItem('guestbookComments');
            console.log('localStorage中的最新数据:', JSON.parse(savedComments));
            
            this.renderComments();
            this.renderPagination();
            this.closeReplyModal();
            alert('回复发表成功！');
            
            // 调试信息
            console.log('回复已保存:', newReply);
            console.log('评论更新:', this.comments[commentIndex]);
        } else {
            console.error('找不到要回复的评论:', this.replyingTo);
            alert('回复失败，请重新尝试');
        }
    }

    // 打开回复模态框
    openReplyModal(comment) {
        if (!comment || !comment.id) {
            alert('无法回复此评论');
            return;
        }
        
        this.replyingTo = { ...comment }; // 创建评论的副本
        this.generateReplyCaptcha();
        document.getElementById('replyModal').classList.add('active');
        document.getElementById('replyUsername').focus();
        document.body.style.overflow = 'hidden';
        
        // 调试信息
        console.log('打开回复模态框:', comment);
        console.log('当前replyingTo:', this.replyingTo);
    }

    // 关闭回复模态框
    closeReplyModal() {
        document.getElementById('replyModal').classList.remove('active');
        document.getElementById('replyForm').reset();
        this.replyingTo = null;
        document.body.style.overflow = '';
        
        // 调试信息
        console.log('回复模态框已关闭，replyingTo已重置');
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
        commentsList.innerHTML = '';

        if (pageComments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">还没有留言，快来发表第一条留言吧！</div>';
            return;
        }

        pageComments.forEach(comment => {
            const commentElement = this.createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });

        // 更新总数
        document.getElementById('totalComments').textContent = this.comments.length;
        
        // 调试信息
        console.log('评论列表已渲染，当前页评论:', pageComments);
    }

    // 创建评论元素
    createCommentElement(comment) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        // 创建回复按钮
        const replyBtn = document.createElement('button');
        replyBtn.className = 'reply-btn';
        replyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            回复
        `;
        
        // 绑定回复事件
        replyBtn.addEventListener('click', () => {
            this.openReplyModal(comment);
        });
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-date">${this.formatDate(comment.date)}</span>
            </div>
            <div class="comment-main">
                <span class="comment-author">${this.escapeHtml(comment.username)}</span>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
            </div>
            <div class="comment-actions">
            </div>
            ${comment.replies.length > 0 ? this.createRepliesSection(comment.replies) : ''}
        `;
        
        // 将回复按钮添加到comment-actions中
        const actionsDiv = commentDiv.querySelector('.comment-actions');
        actionsDiv.appendChild(replyBtn);
        
        return commentDiv;
    }

    // 创建回复区域
    createRepliesSection(replies) {
        if (!replies || replies.length === 0) {
            return '';
        }
        
        const repliesDiv = document.createElement('div');
        repliesDiv.className = 'replies-section';
        
        replies.forEach(reply => {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'reply-item';
            replyDiv.innerHTML = `
                <div class="reply-header">
                    <span class="reply-date">${this.formatDate(reply.date)}</span>
                </div>
                <div class="reply-main">
                    <span class="reply-author">${this.escapeHtml(reply.username)}</span>
                    <div class="reply-content">${this.escapeHtml(reply.content)}</div>
                </div>
            `;
            repliesDiv.appendChild(replyDiv);
        });

        return repliesDiv.outerHTML;
    }

    // 渲染分页
    renderPagination() {
        const totalPages = Math.ceil(this.comments.length / this.commentsPerPage);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // 上一页按钮
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} onclick="guestbook.goToPage(${this.currentPage - 1})">
                上一页
            </button>
        `;

        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="guestbook.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="page-ellipsis">...</span>';
            }
        }

        // 下一页按钮
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="guestbook.goToPage(${this.currentPage + 1})">
                下一页
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    // 跳转到指定页面
    goToPage(page) {
        const totalPages = Math.ceil(this.comments.length / this.commentsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderComments();
        this.renderPagination();
        
        // 滚动到评论列表顶部
        document.getElementById('commentsList').scrollIntoView({ behavior: 'smooth' });
    }

    // 格式化日期
    formatDate(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // HTML转义，防止XSS攻击
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new SearchManager();
    
    // 如果当前页面是留言板页面，初始化留言板功能
    if (window.location.pathname.includes('/ranking/')) {
        window.guestbook = new GuestbookManager();
        
        // 暴露测试方法到全局，方便调试
        window.testReply = () => window.guestbook.testReplyFunction();
        console.log('留言板功能已初始化，可以使用 window.testReply() 来测试回复功能');
    }
});

// 添加一些额外的深色主题样式
const additionalDarkStyles = `
    body.dark-theme .project-preview {
        background: #404040;
    }
    
    body.dark-theme .tech-icon,
    body.dark-theme .tutorial-icon {
        background: #404040;
    }
    
    body.dark-theme .footer {
        background: #2d2d2d;
        border-top-color: #404040;
    }
    
    body.dark-theme .post-item,
    body.dark-theme .ranking-item {
        background: #2d2d2d;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    body.dark-theme .post-item:hover,
    body.dark-theme .ranking-item:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    
    body.dark-theme .post-item .post-title a,
    body.dark-theme .ranking-item .post-title a {
        color: #e5e5e5;
    }
    
    body.dark-theme .post-item .post-excerpt,
    body.dark-theme .ranking-item .post-excerpt {
        color: #a3a3a3;
    }
    
    body.dark-theme .post-item .post-meta,
    body.dark-theme .ranking-item .post-meta {
        color: #737373;
    }
    
    body.dark-theme .more-link {
        color: #60a5fa;
    }
    
    body.dark-theme .more-link:hover {
        color: #93c5fd;
    }
`;

// 动态添加深色主题样式
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalDarkStyles;
document.head.appendChild(styleSheet);
