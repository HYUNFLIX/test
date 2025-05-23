/**
 * 데미안 사용설명서 웹사이트 자바스크립트
 * 애니메이션, 인터랙션, 데이터 시각화를 처리합니다.
 */

// 즉시 실행 함수로 전역 스코프 오염 방지
(function() {
  'use strict';

  // 디바운스 유틸리티 함수 - 스크롤 이벤트 최적화
  function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  // DOM이 완전히 로드된 후 초기화
  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initDetailButtons();
    initBackToTop();
    initCookieBanner();
    initContactForm();
    initCharts();
    initSystemDiagram();
    initAccessibilityFeatures();
  });

  /**
   * 내비게이션 초기화
   */
  function initNavigation() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // 모바일 메뉴 토글 기능
    if (mobileToggle) {
      mobileToggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        navMenu.classList.toggle('active');
        this.setAttribute('aria-expanded', !isExpanded);
        
        // 접근성: 메뉴가 열리면 ESC 키로 닫을 수 있도록 함
        if (!isExpanded) {
          document.addEventListener('keydown', closeMenuOnEscape);
        } else {
          document.removeEventListener('keydown', closeMenuOnEscape);
        }
      });
      
      // 모바일 메뉴 외부 클릭 시 닫기
      document.addEventListener('click', function(e) {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
          navMenu.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
    
    // 네비게이션 링크 스무스 스크롤
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // 접근성 고려: 스크롤 후 해당 요소로 포커스 이동
          smoothScrollTo(targetElement.offsetTop - 70, function() {
            // 스크롤 후 내비게이션 하이라이트 업데이트
            setActiveNavItem();
            
            // 스크린 리더 사용자를 위해 알림
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = targetElement.querySelector('h2').textContent + ' 섹션으로 이동했습니다.';
            document.body.appendChild(announcement);
            
            // 3초 후 알림 요소 제거
            setTimeout(() => announcement.remove(), 3000);
          });
          
          // 모바일 메뉴가 열려있으면 닫기
          if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  }

  /**
   * ESC 키로 메뉴 닫기
   */
  function closeMenuOnEscape(e) {
    if (e.key === 'Escape') {
      const mobileToggle = document.querySelector('.mobile-toggle');
      const navMenu = document.querySelector('.nav-menu');
      
      navMenu.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.focus(); // 접근성: 토글 버튼으로 포커스 이동
    }
  }

  /**
   * 스크롤 효과 초기화
   */
  function initScrollEffects() {
    // 네비게이션 바 스타일 변경
    function updateNavbar() {
      const navbar = document.querySelector('.nav-container');
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    
    // 현재 섹션 하이라이트
    window.setActiveNavItem = function() {
      const navItems = document.querySelectorAll('.nav-item');
      const sections = document.querySelectorAll('section');
      let currentSection = '';
      let scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });
      
      navItems.forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-current', 'false');
        
        if (currentSection && item.getAttribute('href') === `#${currentSection}`) {
          item.classList.add('active');
          item.setAttribute('aria-current', 'true');
        }
      });
    };
    
    // 스크롤 애니메이션 요소 체크
    function checkIfInView() {
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      
      animateElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('visible');
        }
      });
    }
    
    // 최적화된 스크롤 이벤트 핸들러
    const handleScroll = debounce(function() {
      updateNavbar();
      setActiveNavItem();
      checkIfInView();
      
      // 스크롤 위로 버튼 표시/숨김
      const scrollTopBtn = document.querySelector('.scroll-top');
      if (scrollTopBtn) {
        if (window.scrollY > 300) {
          scrollTopBtn.classList.add('active');
        } else {
          scrollTopBtn.classList.remove('active');
        }
      }
    }, 10);
    
    // 스크롤 이벤트 연결
    window.addEventListener('scroll', handleScroll);
    
    // 초기 상태 설정
    updateNavbar();
    setActiveNavItem();
    checkIfInView();
    
    // 리사이즈 이벤트도 처리
    window.addEventListener('resize', debounce(function() {
      setActiveNavItem();
      checkIfInView();
    }, 100));
  }

  /**
   * 상세 정보 버튼 초기화
   */
  function initDetailButtons() {
    const detailButtons = document.querySelectorAll('.feature-details-btn');
    
    detailButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('aria-controls');
        const detailsElement = document.getElementById(targetId);
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
          detailsElement.classList.remove('active');
          this.setAttribute('aria-expanded', 'false');
          this.textContent = '자세히 보기';
        } else {
          detailsElement.classList.add('active');
          this.setAttribute('aria-expanded', 'true');
          this.textContent = '접기';
        }
      });
    });
  }

  /**
   * 스크롤 위로 버튼 초기화
   */
  function initBackToTop() {
    const scrollTopButton = document.querySelector('.scroll-top');
    
    if (scrollTopButton) {
      scrollTopButton.addEventListener('click', function() {
        smoothScrollTo(0);
      });
      
      // 접근성: 키보드 사용자를 위한 키 이벤트 추가
      scrollTopButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          smoothScrollTo(0);
        }
      });
    }
  }

  /**
   * 쿠키 배너 초기화
   */
  function initCookieBanner() {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');
    
    if (cookieBanner) {
      // 쿠키 배너 표시 (쿠키 설정 확인 후)
      if (!getCookie('cookieConsent')) {
        setTimeout(() => {
          cookieBanner.classList.add('active');
        }, 2000);
      }
      
      // 쿠키 동의 버튼
      if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
          setCookie('cookieConsent', 'accepted', 365);
          cookieBanner.classList.remove('active');
        });
      }
      
      // 쿠키 거부 버튼
      if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
          setCookie('cookieConsent', 'rejected', 365);
          cookieBanner.classList.remove('active');
        });
      }
    }
  }

  /**
   * 연락처 폼 초기화
   */
  function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 폼 유효성 검사
        if (validateForm(this)) {
          // 폼 제출 성공 시
          showFormSuccess(this);
        }
      });
    }
  }

  /**
   * 폼 유효성 검사
   */
  function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        showInputError(input, '필수 입력 항목입니다.');
      } else if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
        isValid = false;
        showInputError(input, '유효한 이메일 주소를 입력해주세요.');
      } else {
        clearInputError(input);
      }
    });
    
    return isValid;
  }

  /**
   * 이메일 형식 검증
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 입력 필드 오류 표시
   */
  function showInputError(input, message) {
    clearInputError(input);
    
    input.classList.add('error');
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    input.parentNode.appendChild(errorMessage);
  }

  /**
   * 입력 필드 오류 지우기
   */
  function clearInputError(input) {
    input.classList.remove('error');
    
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
  }

  /**
   * 폼 제출 성공 메시지
   */
  function showFormSuccess(form) {
    // 기존 성공 메시지 제거
    const existingSuccess = document.querySelector('.form-success');
    if (existingSuccess) {
      existingSuccess.remove();
    }
    
    // 폼 내용 숨기기
    const formElements = form.querySelectorAll('.form-group');
    formElements.forEach(el => {
      el.style.display = 'none';
    });
    
    // 성공 메시지 표시
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <h3>문의가 성공적으로 접수되었습니다!</h3>
      <p>빠른 시일 내에 답변 드리겠습니다.</p>
      <button type="button" class="reset-form-btn">다른 문의하기</button>
    `;
    
    form.appendChild(successMessage);
    
    // 폼 초기화 버튼
    const resetBtn = successMessage.querySelector('.reset-form-btn');
    resetBtn.addEventListener('click', function() {
      form.reset();
      successMessage.remove();
      formElements.forEach(el => {
        el.style.display = 'block';
      });
    });
  }

  /**
   * 배터리 애니메이션
   */
  function initBatteryAnimation() {
    const batteryLevel = document.querySelector('.battery-level');
    if (batteryLevel) {
      // 초기 숨겨진 상태에서 애니메이션 효과로 표시
      batteryLevel.style.width = '0%';
      
      setTimeout(function() {
        batteryLevel.style.width = '4%';
      }, 500);
    }
  }

  /**
   * 차트 및 데이터 시각화 초기화
   */
  function initCharts() {
    // 에너지 차트
    initEnergyChart();
    
    // 가치 시너지 차트
    initValueSynergyChart();
  }

  /**
   * 에너지 분배 차트 초기화
   */
  function initEnergyChart() {
    const energyChart = document.getElementById('energyChart');
    
    if (energyChart) {
      // 에너지 데이터
      const energyData = [
        { type: '신체적 에너지', value: 20, color: '#4287f5' },
        { type: '사회적 에너지', value: 38, color: '#42c5f5' },
        { type: '인지적 에너지', value: 26, color: '#4242f5' },
        { type: '휴식', value: 4, color: '#f54242' },
        { type: '기타', value: 12, color: '#86868b' }
      ];
      
      // SVG로 차트 생성
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', '0 0 400 300');
      svg.setAttribute('aria-labelledby', 'energyChartTitle energyChartDesc');
      
      // 접근성을 위한 설명 추가
      const title = document.createElementNS(svgNS, 'title');
      title.setAttribute('id', 'energyChartTitle');
      title.textContent = '에너지 분배 차트';
      svg.appendChild(title);
      
      const desc = document.createElementNS(svgNS, 'desc');
      desc.setAttribute('id', 'energyChartDesc');
      desc.textContent = '신체적, 사회적, 인지적 에너지 및 휴식의 분배 비율을 나타내는 막대 그래프';
      svg.appendChild(desc);
      
      // 막대 그래프 생성
      const barWidth = 50;
      const barGap = 30;
      const maxHeight = 200;
      const startX = 60;
      const startY = 250;
      
      energyData.forEach((item, index) => {
        const barHeight = (item.value / 100) * maxHeight;
        const x = startX + index * (barWidth + barGap);
        const y = startY - barHeight;
        
        // 막대 생성
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', barWidth);
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', item.color);
        rect.setAttribute('rx', '5');
        rect.setAttribute('ry', '5');
        rect.setAttribute('class', 'chart-bar');
        
        // 툴팁 설정
        rect.setAttribute('data-value', `${item.type}: ${item.value}%`);
        
        // 값 표시
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x + barWidth / 2);
        text.setAttribute('y', y - 10);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#000');
        text.setAttribute('font-size', '14');
        text.textContent = `${item.value}%`;
        
        // 라벨 표시
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', x + barWidth / 2);
        label.setAttribute('y', startY + 20);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', '#666');
        label.setAttribute('font-size', '12');
        label.textContent = item.type.split(' ')[0]; // 첫번째 단어만 표시
        
        svg.appendChild(rect);
        svg.appendChild(text);
        svg.appendChild(label);
        
        // 애니메이션 효과
        rect.style.transition = `height 1s ease-out ${index * 0.1}s`;
        setTimeout(() => {
          rect.style.height = `${barHeight}px`;
        }, 100);
      });
      
      energyChart.appendChild(svg);
    }
  }

  /**
   * 가치 시너지 차트 초기화
   */
  function initValueSynergyChart() {
    const synergyChart = document.getElementById('valueSynergyChart');
    
    if (synergyChart) {
      // 가치 데이터
      const values = [
        { id: 'learning', label: '학습', x: 200, y: 80 },
        { id: 'connection', label: '연결', x: 100, y: 160 },
        { id: 'health', label: '건강', x: 300, y: 160 },
        { id: 'profession', label: '전문성', x: 150, y: 240 },
        { id: 'contribution', label: '기여', x: 250, y: 240 }
      ];
      
      // 연결선 데이터
      const connections = [
        { source: 'learning', target: 'connection', strength: 0.8 },
        { source: 'learning', target: 'health', strength: 0.6 },
        { source: 'learning', target: 'profession', strength: 0.9 },
        { source: 'learning', target: 'contribution', strength: 0.7 },
        { source: 'connection', target: 'health', strength: 0.5 },
        { source: 'connection', target: 'contribution', strength: 0.8 },
        { source: 'health', target: 'contribution', strength: 0.6 },
        { source: 'profession', target: 'contribution', strength: 0.7 }
      ];
      
      // SVG로 차트 생성
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', '0 0 400 300');
      svg.setAttribute('aria-labelledby', 'synergyChartTitle synergyChartDesc');
      
      // 접근성을 위한 설명 추가
      const title = document.createElementNS(svgNS, 'title');
      title.setAttribute('id', 'synergyChartTitle');
      title.textContent = '핵심 가치 간 시너지 관계도';
      svg.appendChild(title);
      
      const desc = document.createElementNS(svgNS, 'desc');
      desc.setAttribute('id', 'synergyChartDesc');
      desc.textContent = '학습, 연결, 건강, 전문성, 기여 사이의 관계를 보여주는 네트워크 다이어그램';
      svg.appendChild(desc);
      
      // 연결선 먼저 그리기
      connections.forEach(conn => {
        const source = values.find(v => v.id === conn.source);
        const target = values.find(v => v.id === conn.target);
        
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', source.x);
        line.setAttribute('y1', source.y);
        line.setAttribute('x2', target.x);
        line.setAttribute('y2', target.y);
        line.setAttribute('stroke', '#ccc');
        line.setAttribute('stroke-width', conn.strength * 3);
        line.setAttribute('opacity', '0');
        line.setAttribute('class', 'synergy-line');
        
        svg.appendChild(line);
        
        // 애니메이션 효과
        setTimeout(() => {
          line.style.transition = 'opacity 1s ease-out';
          line.setAttribute('opacity', '0.6');
        }, 500);
      });
      
      // 노드 그리기
      values.forEach((value, index) => {
        const circleGroup = document.createElementNS(svgNS, 'g');
        
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', value.x);
        circle.setAttribute('cy', value.y);
        circle.setAttribute('r', '0');
        circle.setAttribute('fill', '#0071e3');
        circle.setAttribute('class', 'value-node');
        
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', value.x);
        text.setAttribute('y', value.y + 30);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#333');
        text.setAttribute('font-size', '14');
        text.textContent = value.label;
        
        circleGroup.appendChild(circle);
        circleGroup.appendChild(text);
        svg.appendChild(circleGroup);
        
        // 애니메이션 효과
        setTimeout(() => {
          circle.style.transition = 'r 0.5s ease-out';
          circle.setAttribute('r', '20');
        }, index * 200);
      });
      
      synergyChart.appendChild(svg);
    }
  }

  /**
   * 시스템 다이어그램 초기화
   */
  function initSystemDiagram() {
    const systemDiagram = document.getElementById('systemDiagram');
    
    if (systemDiagram) {
      // SVG 생성
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', '0 0 400 300');
      svg.setAttribute('aria-labelledby', 'systemDiagramTitle systemDiagramDesc');
      
      // 접근성을 위한 설명 추가
      const title = document.createElementNS(svgNS, 'title');
      title.setAttribute('id', 'systemDiagramTitle');
      title.textContent = '배움, 익힘, 가르침의 순환 다이어그램';
      svg.appendChild(title);
      
      const desc = document.createElementNS(svgNS, 'desc');
      desc.setAttribute('id', 'systemDiagramDesc');
      desc.textContent = '배움(Study), 익힘(Athletics), 가르침(Personal/Heerim)이 순환적으로 연결되는 과정을 보여주는 다이어그램';
      svg.appendChild(desc);
      
      // 원형 다이어그램
      const centerX = 200;
      const centerY = 150;
      const radius = 100;
      
      // 배경 원
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', centerX);
      circle.setAttribute('cy', centerY);
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#ddd');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      
      // 노드 위치 계산
      const nodes = [
        { id: 'study', label: '배움(Study)', angle: 270, color: '#4287f5' },
        { id: 'athletics', label: '익힘(Athletics)', angle: 30, color: '#42c5f5' },
        { id: 'teaching', label: '가르침(Personal/Heerim)', angle: 150, color: '#4242f5' }
      ];
      
      // 노드 위치 계산 및 좌표 추가
      nodes.forEach(node => {
        const angleRad = (node.angle * Math.PI) / 180;
        node.x = centerX + radius * Math.cos(angleRad);
        node.y = centerY + radius * Math.sin(angleRad);
      });
      
      // 연결선 그리기
      nodes.forEach((source, i) => {
        const target = nodes[(i + 1) % nodes.length];
        
        // 곡선 경로 생성
        const path = document.createElementNS(svgNS, 'path');
        
        // 두 점 사이의 중간점 계산
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        // 중심점을 향해 곡선 제어점 이동
        const ctrlX = midX + (centerX - midX) * 0.5;
        const ctrlY = midY + (centerY - midY) * 0.5;
        
        // 곡선 경로 생성
        const d = `M ${source.x} ${source.y} Q ${ctrlX} ${ctrlY} ${target.x} ${target.y}`;
        
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#0071e3');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.setAttribute('opacity', '0');
        path.setAttribute('class', 'system-path');
        
        svg.appendChild(path);
        
        // 애니메이션 효과
        setTimeout(() => {
          path.style.transition = 'opacity 1s ease-out';
          path.setAttribute('opacity', '1');
        }, 500 + i * 300);
      });
      
      // 화살표 마커 정의
      const defs = document.createElementNS(svgNS, 'defs');
      const marker = document.createElementNS(svgNS, 'marker');
      marker.setAttribute('id', 'arrowhead');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '9');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      
      const polygon = document.createElementNS(svgNS, 'polygon');
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
      polygon.setAttribute('fill', '#0071e3');
      
      marker.appendChild(polygon);
      defs.appendChild(marker);
      svg.appendChild(defs);
      
      // 노드 그리기
      nodes.forEach((node, index) => {
        const nodeGroup = document.createElementNS(svgNS, 'g');
        
        // 원 생성
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', '0');
        circle.setAttribute('fill', node.color);
        circle.setAttribute('class', 'system-node');
        
// 텍스트 생성
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        
        // 짧은 라벨은 원 안에 표시
        const shortLabel = node.id.charAt(0).toUpperCase();
        text.textContent = shortLabel;
        
        // 전체 라벨은 아래에 표시
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', node.x);
        label.setAttribute('y', node.y + 30);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', '#333');
        label.setAttribute('font-size', '14');
        label.textContent = node.label;
        
        nodeGroup.appendChild(circle);
        nodeGroup.appendChild(text);
        nodeGroup.appendChild(label);
        svg.appendChild(nodeGroup);
        
        // 애니메이션 효과
        setTimeout(() => {
          circle.style.transition = 'r 0.5s ease-out';
          circle.setAttribute('r', '20');
        }, 300 + index * 200);
      });
      
      systemDiagram.appendChild(svg);
    }
  }

  /**
   * 부드러운 스크롤 구현
   */
  function smoothScrollTo(targetY, callback) {
    const currentY = window.scrollY;
    const distance = targetY - currentY;
    const duration = 1000; // 스크롤 지속시간(ms)
    const startTime = performance.now();
    
    // 애니메이션 감소 설정 확인
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // 애니메이션 없이 바로 스크롤
      window.scrollTo(0, targetY);
      if (callback) callback();
      return;
    }
    
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
    
    function step(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      window.scrollTo(0, currentY + distance * easedProgress);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else if (callback) {
        callback();
      }
    }
    
    window.requestAnimationFrame(step);
  }

  /**
   * 접근성 기능 초기화
   */
  function initAccessibilityFeatures() {
    // 글자 크기 조절 기능
    initFontSizeControls();
    
    // 높은 대비 모드 토글
    initHighContrastMode();
  }

  /**
   * 글자 크기 조절 기능
   */
  function initFontSizeControls() {
    // 접근성 컨트롤 컨테이너가 없으면 생성
    let accessibilityControls = document.querySelector('.accessibility-controls');
    
    if (!accessibilityControls) {
      accessibilityControls = document.createElement('div');
      accessibilityControls.className = 'accessibility-controls';
      
      // 글자 크기 컨트롤
      const fontSizeControls = document.createElement('div');
      fontSizeControls.className = 'font-size-controls';
      
      // 작게 버튼
      const decreaseBtn = document.createElement('button');
      decreaseBtn.className = 'font-size-btn';
      decreaseBtn.setAttribute('aria-label', '글자 크기 줄이기');
      decreaseBtn.textContent = 'A-';
      
      // 기본 버튼
      const resetBtn = document.createElement('button');
      resetBtn.className = 'font-size-btn';
      resetBtn.setAttribute('aria-label', '기본 글자 크기로 설정');
      resetBtn.textContent = 'A';
      
      // 크게 버튼
      const increaseBtn = document.createElement('button');
      increaseBtn.className = 'font-size-btn';
      increaseBtn.setAttribute('aria-label', '글자 크기 키우기');
      increaseBtn.textContent = 'A+';
      
      // 버튼 이벤트 연결
      decreaseBtn.addEventListener('click', () => adjustFontSize(-1));
      resetBtn.addEventListener('click', () => resetFontSize());
      increaseBtn.addEventListener('click', () => adjustFontSize(1));
      
      // 컨트롤 추가
      fontSizeControls.appendChild(decreaseBtn);
      fontSizeControls.appendChild(resetBtn);
      fontSizeControls.appendChild(increaseBtn);
      
      // 고대비 모드 버튼
      const contrastBtn = document.createElement('button');
      contrastBtn.className = 'contrast-btn';
      contrastBtn.setAttribute('aria-label', '고대비 모드 전환');
      contrastBtn.textContent = '고대비 모드';
      
      contrastBtn.addEventListener('click', toggleHighContrast);
      
      // 컨테이너에 모든 컨트롤 추가
      accessibilityControls.appendChild(fontSizeControls);
      accessibilityControls.appendChild(contrastBtn);
      
      // 바디에 추가
      document.body.appendChild(accessibilityControls);
    }
  }

  /**
   * 글자 크기 조절
   */
  function adjustFontSize(direction) {
    // 현재 폰트 크기 가져오기
    let currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    
    // 저장된 설정이 있으면 사용
    const savedSize = localStorage.getItem('fontSizePercent');
    if (savedSize) {
      currentSize = parseFloat(savedSize);
    }
    
    // 크기 변경 (10% 단위)
    const newSize = direction > 0 ? currentSize * 1.1 : currentSize * 0.9;
    
    // 최소/최대 크기 제한
    const limitedSize = Math.min(Math.max(newSize, 12), 24);
    
    // 설정 적용
    document.documentElement.style.fontSize = `${limitedSize}px`;
    
    // 설정 저장
    localStorage.setItem('fontSizePercent', limitedSize);
    
    // 접근성 알림
    announceToScreenReader(`글자 크기가 ${direction > 0 ? '커졌습니다' : '작아졌습니다'}`);
  }

  /**
   * 글자 크기 초기화
   */
  function resetFontSize() {
    document.documentElement.style.fontSize = '16px';
    localStorage.removeItem('fontSizePercent');
    
    // 접근성 알림
    announceToScreenReader('글자 크기가 기본값으로 초기화되었습니다');
  }

  /**
   * 고대비 모드 초기화
   */
  function initHighContrastMode() {
    // 저장된 설정 확인 및 적용
    const highContrastEnabled = localStorage.getItem('highContrastMode') === 'true';
    
    if (highContrastEnabled) {
      document.body.classList.add('high-contrast');
    }
  }

  /**
   * 고대비 모드 전환
   */
  function toggleHighContrast() {
    const isHighContrast = document.body.classList.toggle('high-contrast');
    
    // 설정 저장
    localStorage.setItem('highContrastMode', isHighContrast);
    
    // 접근성 알림
    announceToScreenReader(`고대비 모드가 ${isHighContrast ? '활성화' : '비활성화'} 되었습니다`);
  }

  /**
   * 스크린 리더에 메시지 알림
   */
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // 3초 후 제거
    setTimeout(() => announcement.remove(), 3000);
  }

  /**
   * 쿠키 설정 유틸리티
   */
  function setCookie(name, value, days) {
    let expires = '';
    
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  /**
   * 쿠키 가져오기 유틸리티
   */
  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    
    return null;
  }

  // 초기화 - 배터리 애니메이션
  initBatteryAnimation();

})();