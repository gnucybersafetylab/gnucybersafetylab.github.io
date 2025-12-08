/**
 * RoboRacer Korea Site JavaScript
 * Main site functionality including accessibility, search, and navigation
 */

document.addEventListener("DOMContentLoaded", function () {
  // Lazy loading images: Add loaded class when image loads
  var lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    lazyImages.forEach(function(img) {
      img.addEventListener('load', function() {
        img.classList.add('loaded');
      });
      // If already loaded (cached), add class immediately
      if (img.complete) {
        img.classList.add('loaded');
      }
    });
  } else {
    // Fallback for browsers without native lazy loading
    var imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }
  
  // Sidebar menu toggles
  var toggles = document.querySelectorAll(".sidebar-menu .toggle");

  toggles.forEach(function (t) {
    t.addEventListener("click", function () {
      var next = t.nextElementSibling;
      if (next && next.classList.contains("sub-items")) {
        // 접힘/펼침 토글
        var isExpanded = next.style.display === "block";
        next.style.display = isExpanded ? "none" : "block";
        t.setAttribute("aria-expanded", !isExpanded);
      }
    });
    
    // 키보드 접근성: Enter와 Space 키 지원
    t.addEventListener("keydown", function(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        t.click();
      }
    });
  });
  
  // Navigation menu toggle accessibility
  var navToggle = document.querySelector(".navbar-toggle");
  var navCollapse = document.querySelector(".navbar-collapse");
  
  if (navToggle && navCollapse) {
    navCollapse.addEventListener("show.bs.collapse", function() {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "메뉴 닫기");
    });
    
    navCollapse.addEventListener("hide.bs.collapse", function() {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "메뉴 열기");
    });
  }
  
  // Tab navigation keyboard support
  var tabLists = document.querySelectorAll('.org-nav-tabs[role="tablist"]');
  tabLists.forEach(function(tabList) {
    var tabs = tabList.querySelectorAll('[role="tab"]');
    
    tabs.forEach(function(tab, index) {
      // Set initial aria-selected state
      var isActive = tab.parentElement.classList.contains('active') || tab.classList.contains('active');
      tab.setAttribute('aria-selected', isActive);
      
      tab.addEventListener("keydown", function(e) {
        var currentIndex = Array.from(tabs).indexOf(tab);
        var nextIndex;
        
        switch(e.key) {
          case "ArrowRight":
            e.preventDefault();
            nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
            break;
          case "ArrowLeft":
            e.preventDefault();
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
            break;
          case "Home":
            e.preventDefault();
            tabs[0].focus();
            tabs[0].click();
            break;
          case "End":
            e.preventDefault();
            tabs[tabs.length - 1].focus();
            tabs[tabs.length - 1].click();
            break;
        }
      });
      
      // Update aria-selected when tab is clicked
      tab.addEventListener("click", function() {
        tabs.forEach(function(t) {
          t.setAttribute('aria-selected', 'false');
        });
        tab.setAttribute('aria-selected', 'true');
      });
    });
  });
  
  // Bootstrap tab events - update aria-selected for Bootstrap tabs
  if (typeof jQuery !== 'undefined') {
    jQuery('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      var target = jQuery(e.target);
      var tabList = target.closest('[role="tablist"]');
      if (tabList.length) {
        tabList.find('[role="tab"]').attr('aria-selected', 'false');
        target.attr('aria-selected', 'true');
      }
    });
  }
  
  // Search functionality
  var searchToggle = document.getElementById('search-toggle-btn');
  var searchForm = document.getElementById('site-search-form');
  var searchInput = document.getElementById('site-search-input');
  var searchResultsModal = document.getElementById('search-results-modal');
  var searchResultsBody = document.getElementById('search-results-body');
  
  // Toggle search form
  if (searchToggle && searchForm) {
    searchToggle.addEventListener('click', function(e) {
      e.preventDefault();
      var isVisible = searchForm.style.display !== 'none';
      searchForm.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && searchInput) {
        setTimeout(function() {
          searchInput.focus();
        }, 100);
      }
    });
  }
  
  // Search functionality
  var searchIndex = [];
  
  // Build search index from page content
  function buildSearchIndex() {
    var pages = [
      { 
        title: 'About', 
        titleKo: '소개', 
        url: '/', 
        keywords: 'RoboRacer Korea, 자율주행, 교육, 레이스, 연구, 소개, about' 
      },
      { 
        title: 'Organization', 
        titleKo: '조직 소개', 
        url: '/organization/', 
        keywords: '조직, 구조, 비전, 규정, organization, 조직 소개' 
      },
      { 
        title: 'Build', 
        titleKo: '차량 제작', 
        url: '/build/', 
        keywords: '차량 제작, Jetson, 드라이버, 설정, build, 빌드, 제작' 
      },
      { 
        title: 'Learn', 
        titleKo: '학습', 
        url: '/learn/', 
        keywords: '교육, 강의, 리소스, 커리큘럼, learn, 학습, 배우기' 
      },
      { 
        title: 'Race', 
        titleKo: '레이스', 
        url: '/race/', 
        keywords: '경진대회, 레이스, 규칙, 룰, 규정, 이벤트, race, 대회, 경주' 
      },
      { 
        title: 'Events', 
        titleKo: '학술행사', 
        url: '/events/', 
        keywords: '학술행사, 컨퍼런스, 워크숍, events, 행사, 학회' 
      },
      { 
        title: 'Research', 
        titleKo: '연구', 
        url: '/research.html', 
        keywords: '연구, 논문, 데이터셋, research, 연구 활동' 
      },
      { 
        title: 'Education', 
        titleKo: '교육 프로그램', 
        url: '/edu/', 
        keywords: '교육, 교육 프로그램, 초급 과정, 중급 과정, 교육 신청, education, edu, 교육 과정' 
      },
      { 
        title: 'Community', 
        titleKo: '커뮤니티', 
        url: '/community.html', 
        keywords: '커뮤니티, 네트워크, 교수진, community, 학술 네트워크' 
      },
      { 
        title: 'News', 
        titleKo: '뉴스', 
        url: '/news/', 
        keywords: '뉴스, 공지사항, 소식, news, 최신 소식' 
      },
      { 
        title: 'Record', 
        titleKo: '기록', 
        url: '/record.html', 
        keywords: '기록, 영상, 사진, 대회, record, 기록 보관' 
      },
      { 
        title: 'Join', 
        titleKo: '가입', 
        url: '/join/', 
        keywords: '가입, 신청, 참여, join, 회원 가입, 참여 신청' 
      }
    ];
    
    var mainContent = document.querySelector('main');
    if (mainContent) {
      var textContent = mainContent.innerText || mainContent.textContent || '';
      var currentPage = {
        title: document.title.split(' | ')[0],
        url: window.location.pathname,
        content: textContent.substring(0, 1000)
      };
      pages.push(currentPage);
    }
    
    return pages;
  }
  
  // Perform search
  function performSearch(query) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    var index = buildSearchIndex();
    var results = [];
    var queryTrimmed = query.trim();
    var queryLower = queryTrimmed.toLowerCase();
    var queryTerms = queryLower.split(/\s+/);
    
    // 한글 검색을 위한 정규화 함수 (띄어쓰기 무시)
    function normalizeForSearch(text) {
      if (!text) return '';
      return text.toLowerCase().replace(/\s+/g, '');
    }
    
    index.forEach(function(page) {
      var score = 0;
      var title = (page.title || '').toLowerCase();
      var titleKo = (page.titleKo || '').toLowerCase();
      var keywords = (page.keywords || '').toLowerCase();
      var content = (page.content || '').toLowerCase();
      var url = page.url || '';
      
      // 검색어 정규화
      var queryNormalized = normalizeForSearch(queryTrimmed);
      
      queryTerms.forEach(function(term) {
        var termNormalized = normalizeForSearch(term);
        
        // 영어 제목 매칭
        if (title.indexOf(term) !== -1) score += 10;
        
        // 한글 제목 매칭 (정확한 매칭)
        if (titleKo.indexOf(term) !== -1) score += 10;
        
        // 한글 제목 부분 매칭 (띄어쓰기 무시)
        if (normalizeForSearch(titleKo).indexOf(termNormalized) !== -1) score += 8;
        
        // 키워드 매칭
        if (keywords.indexOf(term) !== -1) score += 5;
        if (normalizeForSearch(keywords).indexOf(termNormalized) !== -1) score += 4;
        
        // 본문 내용 매칭
        if (content.indexOf(term) !== -1) score += 1;
        if (normalizeForSearch(content).indexOf(termNormalized) !== -1) score += 1;
      });
      
      // 전체 검색어가 한글 제목에 포함되는 경우 추가 점수
      if (titleKo && normalizeForSearch(titleKo).indexOf(queryNormalized) !== -1) {
        score += 15;
      }
      
      if (score > 0) {
        var snippet = '';
        var contentIndex = content.indexOf(queryLower);
        if (contentIndex === -1) {
          // 한글 검색어의 경우 정규화된 검색 시도
          var contentNormalized = normalizeForSearch(content);
          var queryIndex = contentNormalized.indexOf(queryNormalized);
          if (queryIndex !== -1) {
            // 원본 텍스트에서 대략적인 위치 찾기
            var originalIndex = Math.floor(queryIndex * (content.length / contentNormalized.length));
            contentIndex = originalIndex;
          }
        }
        
        if (contentIndex !== -1) {
          var start = Math.max(0, contentIndex - 50);
          var end = Math.min(content.length, contentIndex + queryTrimmed.length + 50);
          snippet = content.substring(start, end);
          if (start > 0) snippet = '...' + snippet;
          if (end < content.length) snippet = snippet + '...';
        } else {
          snippet = content.substring(0, 150);
          if (content.length > 150) snippet += '...';
        }
        
        // 한글 제목이 있으면 표시, 없으면 영어 제목
        var displayTitle = page.titleKo ? page.titleKo + ' (' + page.title + ')' : page.title;
        
        results.push({
          title: page.title,
          titleKo: page.titleKo || '',
          displayTitle: displayTitle,
          url: url,
          snippet: snippet,
          score: score
        });
      }
    });
    
    results.sort(function(a, b) {
      return b.score - a.score;
    });
    
    return results.slice(0, 10);
  }
  
  // Display search results
  function displaySearchResults(results, query) {
    if (!searchResultsBody) return;
    
    if (results.length === 0) {
      searchResultsBody.innerHTML = '<div class="no-results"><p>검색 결과가 없습니다.</p><p class="text-muted">다른 검색어를 시도해보세요.</p></div>';
      return;
    }
    
    var html = '<div class="search-results-list">';
    results.forEach(function(result) {
      var displayTitle = result.displayTitle || result.title;
      var highlightedTitle = displayTitle;
      var highlightedSnippet = result.snippet;
      
      // 검색어 하이라이트 (대소문자 구분 없이, 한글도 포함)
      query.split(/\s+/).forEach(function(term) {
        if (term.length > 0) {
          // 특수문자 이스케이프
          var escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var regex = new RegExp('(' + escapedTerm + ')', 'gi');
          highlightedTitle = highlightedTitle.replace(regex, '<span class="search-highlight">$1</span>');
          highlightedSnippet = highlightedSnippet.replace(regex, '<span class="search-highlight">$1</span>');
        }
      });
      
      html += '<div class="search-result-item">';
      html += '<div class="search-result-title"><a href="' + result.url + '">' + highlightedTitle + '</a></div>';
      html += '<div class="search-result-url">' + result.url + '</div>';
      html += '<div class="search-result-snippet">' + highlightedSnippet + '</div>';
      html += '</div>';
    });
    html += '</div>';
    
    searchResultsBody.innerHTML = html;
  }
  
  // Handle search form submission
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var query = searchInput.value.trim();
      
      if (query.length < 2) {
        alert('검색어는 최소 2자 이상 입력해주세요.');
        return;
      }
      
      var results = performSearch(query);
      displaySearchResults(results, query);
      
      if (searchResultsModal && typeof jQuery !== 'undefined') {
        jQuery(searchResultsModal).modal('show');
      }
    });
  }
  
  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchToggle) {
        searchToggle.click();
      }
    }
  });
});

