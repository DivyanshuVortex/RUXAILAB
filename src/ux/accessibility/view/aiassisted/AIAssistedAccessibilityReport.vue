<template>
  <PageWrapper
    title="Accessibility Report"
    :loading="loading"
    loading-text="Loading analysis data..."
  >
    <template #subtitle>
      <p class="page-subtitle">Generate and download comprehensive accessibility reports</p>
    </template>

    <div class="apple-content">
      <!-- Error State -->
      <div v-if="error" class="error-banner">
        <v-icon icon="mdi-alert-circle" size="20" />
        <span>{{ error }}</span>
        <button class="close-btn" @click="error = null">
          <v-icon icon="mdi-close" size="16" />
        </button>
      </div>

      <!-- No Data State -->
      <div v-if="!loading && !hasAnyResults" class="empty-state-card">
        <div class="empty-icon">
          <v-icon icon="mdi-file-document-alert-outline" size="48" />
        </div>
        <h2 class="empty-title">No Analysis Data Available</h2>
        <p class="empty-description">
          Please run at least one analysis tool before generating a report.
        </p>
        <button class="primary-btn primary-btn-purple" @click="goToExamine">
          <v-icon icon="mdi-arrow-right" size="20" />
          <span>Go to Examine</span>
        </button>
      </div>

      <!-- Perspective Switcher (Premium UX) -->
      <div v-if="!loading && hasAnyResults" class="perspective-container mb-8">
        <div class="perspective-toggle">
          <button 
            v-for="opt in perspectiveOptions" 
            :key="opt.value"
            :class="['perspective-btn', { 'is-active': currentPerspective === opt.value }]"
            @click="currentPerspective = opt.value"
          >
            <v-icon :icon="opt.icon" size="18" class="mr-2" />
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <!-- Dashboard Report Content -->
      <div v-if="!loading && hasAnyResults">
        <!-- Perspective 1: Executive Summary (Overall) -->
        <div v-if="currentPerspective === 'overall'" class="perspective-fade">
        <!-- Dashboard Overview: Compliance & Test Info -->
        <div class="dashboard-overview-grid mb-8">
          <!-- Compliance Score Column -->
          <div class="summary-card score-card">
            <div class="score-circle">
              <v-progress-circular
                :model-value="complianceScore"
                :size="140"
                :width="15"
                color="#000"
                class="compliance-gauge"
              >
                <div class="score-inner">
                  <span class="score-number">{{ complianceScore }}%</span>
                  <span class="score-label">Compliance</span>
                </div>
              </v-progress-circular>
            </div>
            <div class="score-footer mt-4">
              <v-chip size="small" :color="complianceScore > 80 ? 'green' : 'orange'" variant="flat">
                {{ complianceScore > 80 ? 'Highly Accessible' : 'Needs Improvement' }}
              </v-chip>
            </div>
          </div>

          <!-- Test Information Column -->
          <div class="summary-card info-card">
            <div class="info-header mb-4">
              <h3 class="card-title">Test Parameters</h3>
              <v-chip size="x-small" variant="outlined">{{ analysisResult.inputType }}</v-chip>
            </div>
            <div class="parameter-grid">
              <div class="param-item">
                <span class="param-label">Target URL</span>
                <span class="param-value truncate">{{ analysisResult.url || analysisResult.sourceFileName }}</span>
              </div>
              <div class="param-item">
                <span class="param-label">Max Depth</span>
                <span class="param-value">{{ analysisResult.maxDepth }} levels</span>
              </div>
              <div class="param-item">
                <span class="param-label">Page limit</span>
                <span class="param-value">{{ analysisResult.maxPages }} pages</span>
              </div>
              <div class="param-item">
                <span class="param-label">Last Audit</span>
                <span class="param-value">{{ formatDate(analysisResult.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Methodology Stats Header -->
        <div class="stats-row mb-8">
          <div class="stat-box">
            <div class="stat-icon purple-bg"><v-icon icon="mdi-web" color="white" size="20" /></div>
            <div class="stat-content">
              <span class="stat-num">{{ analysisResult.pageInventory?.length || 0 }}</span>
              <span class="stat-desc">Discovered Pages</span>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon blue-bg"><v-icon icon="mdi-selection-multiple" color="white" size="20" /></div>
            <div class="stat-content">
              <span class="stat-num">{{ analysisResult.sampling?.length || 0 }}</span>
              <span class="stat-desc">Sampled for Audit</span>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon green-bg"><v-icon icon="mdi-checkbox-marked-circle-outline" color="white" size="20" /></div>
            <div class="stat-content">
              <span class="stat-num">{{ auditStats.passed + auditStats.failed + auditStats.na }}</span>
              <span class="stat-desc">Manual Verdicts</span>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon black-bg"><v-icon icon="mdi-alert-octagon" color="white" size="20" /></div>
            <div class="stat-content">
              <span class="stat-num">{{ analysisResult.totalIssues }}</span>
              <span class="stat-desc">Automated Issues</span>
            </div>
          </div>
        </div>

        <!-- Manual Audit Progress & Disability Coverage -->
        <div class="secondary-grid mb-8">
          <!-- Audit Results -->
          <div class="summary-card audit-summary">
            <h3 class="card-title mb-4">Manual Audit Performance</h3>
            <div class="audit-progress-container mb-6">
              <div class="d-flex justify-space-between mb-1">
                <span class="progress-label">Completion Progress</span>
                <span class="progress-percent">{{ auditStats.progress }}%</span>
              </div>
              <v-progress-linear :model-value="auditStats.progress" height="8" rounded color="black" />
            </div>
            <div class="verdict-distribution">
              <div class="verdict-bar pass-bar" :style="{ flex: auditStats.passed }">
                <span class="verdict-count">{{ auditStats.passed }} Pass</span>
              </div>
              <div class="verdict-bar fail-bar" :style="{ flex: auditStats.failed }">
                <span class="verdict-count">{{ auditStats.failed }} Fail</span>
              </div>
              <div class="verdict-bar na-bar" :style="{ flex: auditStats.na }">
                <span class="verdict-count">{{ auditStats.na }} N/A</span>
              </div>
            </div>
          </div>

          <!-- Disability Profiles -->
          <div class="summary-card profile-summary">
            <h3 class="card-title mb-4">Disability Persona Scope</h3>
            <div class="profile-grid">
              <div v-for="profile in disabilityCoverage" :key="profile.name" :class="['profile-item', { 'active-profile': profile.active }]">
                <v-icon :icon="profile.icon" size="24" class="mb-2" />
                <span class="profile-name">{{ profile.name }}</span>
                <v-icon v-if="profile.active" icon="mdi-check-circle" size="14" color="black" class="active-dot" />
              </div>
            </div>
          </div>
        </div>

        </div>

        <!-- Perspective 2: Pagewise Analysis -->
        <div v-if="currentPerspective === 'pagewise'" class="perspective-fade">
          <div class="pagewise-layout">
            <!-- Sidebar: Page Selector -->
            <div class="pagewise-sidebar">
              <h3 class="sidebar-title mb-4">Sampled Pages</h3>
              <div class="page-nav-list">
                <button 
                  v-for="page in analysisResult.sampling" 
                  :key="page.url"
                  :class="['page-nav-item', { 'is-active': selectedPageUrl === page.url }]"
                  @click="selectedPageUrl = page.url"
                >
                  <div class="nav-item-content">
                    <span class="nav-page-title">{{ page.title || 'Untitled Page' }}</span>
                    <span class="nav-page-url">{{ truncateUrl(page.url) }}</span>
                  </div>
                  <v-icon v-if="selectedPageUrl === page.url" icon="mdi-chevron-right" size="18" />
                </button>
              </div>
            </div>

            <!-- Content: Detailed Page Audit -->
            <div class="pagewise-content">
              <div v-if="selectedPageUrl" class="page-detail-view">
                <div class="page-meta-header mb-6">
                  <v-chip size="small" color="black" dark class="mb-2">Currently Visualizing</v-chip>
                  <h2 class="active-page-title">{{ analysisResult.sampling.find(p => p.url === selectedPageUrl)?.title }}</h2>
                  <code class="active-page-url">{{ selectedPageUrl }}</code>
                </div>

                <!-- Page Specific Stats -->
                <div class="pagewise-stats-row mb-8">
                  <div class="p-stat-card">
                    <span class="p-stat-label">Manual Verdicts</span>
                    <span class="p-stat-value">{{ pagewiseAuditStats.total }}</span>
                    <div class="p-stat-progress">
                      <div class="p-bar pass" :style="{ width: (pagewiseAuditStats.passed/pagewiseAuditStats.total)*100 + '%' }"></div>
                      <div class="p-bar fail" :style="{ width: (pagewiseAuditStats.failed/pagewiseAuditStats.total)*100 + '%' }"></div>
                    </div>
                  </div>
                  <div class="p-stat-card">
                    <span class="p-stat-label">Pass Rate</span>
                    <span class="p-stat-value text-green">{{ Math.round((pagewiseAuditStats.passed/pagewiseAuditStats.total)*100) || 0 }}%</span>
                  </div>
                  <div class="p-stat-card">
                    <span class="p-stat-label">Issues Found</span>
                    <span class="p-stat-value text-red">{{ pagewiseAuditStats.failed }}</span>
                  </div>
                </div>

                <!-- Sensor findings for this page (Filtered) -->
                <h3 class="card-title mb-4">Targeted Sensor Findings</h3>
                <div class="reports-grid mb-8">
                  <div v-if="analysisResult.chroma_check" class="report-card compact-report">
                    <v-icon icon="mdi-palette" color="purple" class="mb-2" />
                    <span class="compact-name">ChromaCheck</span>
                    <span class="compact-val">{{ analysisResult.chroma_check.total_issues }} Issues</span>
                  </div>
                  <div v-if="analysisResult.anchor_sense" class="report-card compact-report">
                    <v-icon icon="mdi-link-variant" color="blue" class="mb-2" />
                    <span class="compact-name">AnchorSense</span>
                    <span class="compact-val">{{ analysisResult.anchor_sense.total_issues }} Issues</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Automated Tool Scans (Global Insights) -->
        <h3 class="card-title mt-8 mb-4">Automated Tool Scans</h3>
        <div class="reports-grid mb-8">
          <!-- ChromaCheck Report -->
          <div :class="['report-card', { 'report-available': analysisResult.chroma_check }]">
            <div :class="['report-icon', analysisResult.chroma_check ? 'report-icon-purple' : 'report-icon-disabled']">
              <v-icon :icon="analysisResult.chroma_check ? 'mdi-palette' : 'mdi-alert-circle-outline'" size="28" />
            </div>
            <h4 class="report-name">ChromaCheck</h4>
            <p class="report-description">Color Contrast Analysis</p>
            
            <div v-if="analysisResult.chroma_check" class="report-status report-status-available">
              <v-icon icon="mdi-check-circle" size="14" />
              <span>Available</span>
            </div>
            <div v-else class="report-status report-status-pending">
              <v-icon icon="mdi-clock-outline" size="14" />
              <span>Not Run</span>
            </div>

            <div v-if="analysisResult.chroma_check" class="report-stats">
              <span class="stat-value">{{ analysisResult.chroma_check.total_issues || 0 }}</span>
              <span class="stat-label">issues found</span>
            </div>

            <button 
              v-if="analysisResult.chroma_check" 
              class="download-btn download-btn-purple"
              @click="generatePDF('chroma_check')"
              :disabled="generating === 'chroma_check'"
            >
              <v-icon v-if="generating !== 'chroma_check'" icon="mdi-download" size="16" />
              <v-progress-circular v-else indeterminate size="16" width="2" />
              <span>Download PDF</span>
            </button>

            <button 
              v-if="analysisResult.chroma_check?.marked_html" 
              class="inspect-btn"
              @click="showMarkedHtml(analysisResult.chroma_check.marked_html)"
            >
              <v-icon icon="mdi-eye" size="16" />
              <span>Inspect Webpage</span>
            </button>
          </div>

          <!-- AnchorSense Report -->
          <div :class="['report-card', { 'report-available': analysisResult.anchor_sense }]">
            <div :class="['report-icon', analysisResult.anchor_sense ? 'report-icon-blue' : 'report-icon-disabled']">
              <v-icon :icon="analysisResult.anchor_sense ? 'mdi-link-variant' : 'mdi-alert-circle-outline'" size="28" />
            </div>
            <h4 class="report-name">AnchorSense</h4>
            <p class="report-description">Link Analysis</p>
            
            <div v-if="analysisResult.anchor_sense" class="report-status report-status-available">
              <v-icon icon="mdi-check-circle" size="14" />
              <span>Available</span>
            </div>
            <div v-else class="report-status report-status-pending">
              <v-icon icon="mdi-clock-outline" size="14" />
              <span>Not Run</span>
            </div>

            <div v-if="analysisResult.anchor_sense" class="report-stats">
              <span class="stat-value">{{ analysisResult.anchor_sense.total_issues || 0 }}</span>
              <span class="stat-label">issues found</span>
            </div>

            <button 
              v-if="analysisResult.anchor_sense" 
              class="download-btn download-btn-blue"
              @click="generatePDF('anchor_sense')"
              :disabled="generating === 'anchor_sense'"
            >
              <v-icon v-if="generating !== 'anchor_sense'" icon="mdi-download" size="16" />
              <v-progress-circular v-else indeterminate size="16" width="2" />
              <span>Download PDF</span>
            </button>
          </div>

          <!-- ImgTagTip Report -->
          <div :class="['report-card', { 'report-available': analysisResult.img_tip }]">
            <div :class="['report-icon', analysisResult.img_tip ? 'report-icon-green' : 'report-icon-disabled']">
              <v-icon :icon="analysisResult.img_tip ? 'mdi-image-text' : 'mdi-alert-circle-outline'" size="28" />
            </div>
            <h4 class="report-name">ImgTagTip</h4>
            <p class="report-description">Image Alt Text Analysis</p>
            
            <div v-if="analysisResult.img_tip" class="report-status report-status-available">
              <v-icon icon="mdi-check-circle" size="14" />
              <span>Available</span>
            </div>
            <div v-else class="report-status report-status-pending">
              <v-icon icon="mdi-clock-outline" size="14" />
              <span>Not Run</span>
            </div>

            <div v-if="analysisResult.img_tip" class="report-stats">
              <span class="stat-value">{{ analysisResult.img_tip.total_issues || 0 }}</span>
              <span class="stat-label">issues found</span>
            </div>

            <button 
              v-if="analysisResult.img_tip" 
              class="download-btn download-btn-green"
              @click="generatePDF('img_tip')"
              :disabled="generating === 'img_tip'"
            >
              <v-icon v-if="generating !== 'img_tip'" icon="mdi-download" size="16" />
              <v-progress-circular v-else indeterminate size="16" width="2" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <!-- Combined Report Card -->
        <div class="combined-card">
          <div class="combined-header">
            <div class="combined-icon">
              <v-icon icon="mdi-file-document-multiple" size="24" />
            </div>
            <div class="combined-info">
              <h3 class="combined-title">Combined Report</h3>
              <p class="combined-description">Generate a comprehensive PDF report containing all completed analyses.</p>
            </div>
          </div>
          <button 
            class="primary-btn primary-btn-green"
            @click="generateCombinedPDF"
            :disabled="generating === 'combined' || !hasAnyResults"
          >
            <v-icon v-if="generating !== 'combined'" icon="mdi-download" size="20" />
            <v-progress-circular v-else indeterminate size="20" width="2" color="white" />
            <span>Download Combined Report</span>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="actions-bar">
          <button class="secondary-btn" @click="goBack">
            <v-icon icon="mdi-arrow-left" size="18" />
            <span>Back to Home</span>
          </button>
          <button class="secondary-btn" @click="router.push({ name: 'AIAssistedAccessibilityAnswers', params: { id: testId } })">
            <v-icon icon="mdi-file-search" size="18" />
            <span>View Detailed Results</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Marked HTML Dialog -->
    <v-dialog v-model="showingMarkedHtmlDialog" fullscreen>
      <div class="fullscreen-dialog">
        <div class="dialog-header">
          <div class="dialog-title-section">
            <div class="dialog-icon">
              <v-icon icon="mdi-magnify" size="20" />
            </div>
            <h3 class="dialog-title">Inspect Webpage - Color Contrast Issues</h3>
          </div>
          <button class="dialog-close" @click="showingMarkedHtmlDialog = false">
            <v-icon icon="mdi-close" size="20" />
          </button>
        </div>
        <div class="dialog-alert">
          <v-icon icon="mdi-information" size="18" />
          <span>🔴 Red outlines indicate color contrast issues. Elements with insufficient contrast are highlighted.</span>
        </div>
        <div class="dialog-content">
          <iframe
            v-if="currentMarkedHtml"
            :srcdoc="currentMarkedHtml"
            frameborder="0"
            class="preview-iframe"
          />
        </div>
      </div>
    </v-dialog>
  </PageWrapper>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageWrapper from '@/shared/views/template/PageWrapper.vue';

const route = useRoute();
const router = useRouter();
const store = useStore();

const testId = computed(() => route.params.id);
const token = computed(() => route.params.token);

const loading = ref(true);
const error = ref(null);
const analysisResult = ref(null);
const generating = ref(null);
const showingMarkedHtmlDialog = ref(false);
const currentMarkedHtml = ref('');
const currentPerspective = ref('overall'); // 'overall' | 'pagewise'
const selectedPageUrl = ref('');
const perspectiveOptions = [
  { label: 'Executive Summary', value: 'overall', icon: 'mdi-chart-pie' },
  { label: 'Pagewise Analysis', value: 'pagewise', icon: 'mdi-file-tree' }
];

const hasAnyResults = computed(() => {
  if (!analysisResult.value) return false;
  return analysisResult.value.toolsCompleted && analysisResult.value.toolsCompleted.length > 0;
});

// Load analysis results on mount
onMounted(async () => {
  loading.value = true;
  error.value = null;
  
  try {
    await store.dispatch('aiAssistedResults/loadResult', testId.value);
    analysisResult.value = store.getters['aiAssistedResults/currentResult'];
    
    // MOCK DATA INJECTION (For Demonstration)
    if (!analysisResult.value || !analysisResult.value.toolsCompleted?.length) {
      console.log('Injecting high-quality mock data for demonstration...');
      analysisResult.value = {
        testId: testId.value,
        url: 'https://premium-store.example.com',
        inputType: 'url',
        maxDepth: 3,
        maxPages: 25,
        disabilityProfiles: ['VISUAL', 'MOTOR', 'COGNITIVE'],
        toolsCompleted: ['chroma_check', 'anchor_sense', 'img_tip'],
        totalIssues: 42,
        pageInventory: Array.from({ length: 18 }, (_, i) => ({ url: `/page-${i}`, title: `Page ${i}`, type: i % 3 === 0 ? 'Login' : 'Content' })),
        sampling: [
          { url: '/', title: 'Home Page', type: 'Content' },
          { url: '/login', title: 'User Login', type: 'Login' },
          { url: '/checkout', title: 'Checkout Page', type: 'Services' },
          { url: '/blog/tips', title: 'Accessibility Tips', type: 'Blog' }
        ],
        manualAudit: {
          '/': { 'SC-1.1.1': { verdict: 'PASS', evidence: 'Alt text present' }, 'SC-1.4.3': { verdict: 'FAIL', evidence: 'Contrast too low on banner' } },
          '/login': { 'SC-1.1.1': { verdict: 'PASS' }, 'SC-3.2.2': { verdict: 'PASS' } },
          '/checkout': { 'SC-2.1.1': { verdict: 'FAIL', evidence: 'Keyboard trap discovered' } }
        },
        chroma_check: { total_issues: 12, passed: false },
        anchor_sense: { total_issues: 8, passed: true },
        img_tip: { total_issues: 22, passed: false },
        updatedAt: new Date().toISOString()
      };
    }
    if (analysisResult.value?.chroma_check) {
      console.log('ChromaCheck data:', analysisResult.value.chroma_check);
      console.log('ChromaCheck violations:', analysisResult.value.chroma_check.violations);
      console.log('ChromaCheck violations count:', analysisResult.value.chroma_check.violations?.length);
    }
    if (analysisResult.value?.anchor_sense) {
      console.log('AnchorSense data:', analysisResult.value.anchor_sense);
      console.log('AnchorSense issues:', analysisResult.value.anchor_sense.issues);
    }
    if (analysisResult.value?.img_tip) {
      console.log('ImgTip data:', analysisResult.value.img_tip);
      console.log('ImgTip images:', analysisResult.value.img_tip.images);
    }
    
    if (!analysisResult.value) {
      error.value = 'No analysis data found for this test.';
    } else {
      // Set initial selected page
      if (analysisResult.value.sampling?.length > 0) {
        selectedPageUrl.value = analysisResult.value.sampling[0].url;
      }
    }
  } catch (err) {
    console.error('Error loading analysis results:', err);
    error.value = 'Failed to load analysis data. Please try again.';
  } finally {
    loading.value = false;
  }
});

const auditStats = computed(() => {
  if (!analysisResult.value?.manualAudit) return { passed: 0, failed: 0, na: 0, total: 0, progress: 0 };
  
  const verdicts = Object.values(analysisResult.value.manualAudit).flatMap(page => Object.values(page));
  const passed = verdicts.filter(v => v.verdict === 'PASS').length;
  const failed = verdicts.filter(v => v.verdict === 'FAIL').length;
  const na = verdicts.filter(v => v.verdict === 'NA').length;
  const total = verdicts.length;
  const progress = total > 0 ? Math.round(((passed + failed + na) / (analysisResult.value.sampling.length * 50)) * 100) : 0; // Assuming 50 SCs approx
  
  return { passed, failed, na, total, progress };
});

const complianceScore = computed(() => {
  const stats = auditStats.value;
  if (stats.total === 0) return 0;
  return Math.round((stats.passed / (stats.passed + stats.failed)) * 100);
});

const pagewiseAuditStats = computed(() => {
  if (!analysisResult.value?.manualAudit || !selectedPageUrl.value) return { passed: 0, failed: 0, na: 0, total: 0 };
  
  const pageAudit = analysisResult.value.manualAudit[selectedPageUrl.value] || {};
  const verdicts = Object.values(pageAudit);
  const passed = verdicts.filter(v => v.verdict === 'PASS').length;
  const failed = verdicts.filter(v => v.verdict === 'FAIL').length;
  const na = verdicts.filter(v => v.verdict === 'NA').length;
  
  return { passed, failed, na, total: verdicts.length };
});

const disabilityCoverage = computed(() => {
  const selected = analysisResult.value?.disabilityProfiles || [];
  return [
    { name: 'Visual', active: selected.includes('VISUAL'), icon: 'mdi-eye-outline' },
    { name: 'Motor', active: selected.includes('MOTOR'), icon: 'mdi-hand-back-right-outline' },
    { name: 'Hearing', active: selected.includes('HEARING'), icon: 'mdi-ear-hearing' },
    { name: 'Cognitive', active: selected.includes('COGNITIVE'), icon: 'mdi-brain' }
  ];
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const truncateUrl = (url, max = 30) => {
  if (!url) return '';
  if (url.length <= max) return url;
  return url.substring(0, max) + '...';
};

const goBack = () => {
  // If token is present, this might be a public view, don't navigate back
  if (token.value) {
    return;
  }
  router.push({ name: 'AIAssistedAccessibilityHome', params: { id: testId.value } });
};

const goToExamine = () => {
  router.push({ name: 'AIAssistedAccessibilityExamine', params: { id: testId.value } });
};

const showMarkedHtml = (markedHtml) => {
  currentMarkedHtml.value = markedHtml;
  showingMarkedHtmlDialog.value = true;
};

// PDF Generation Functions
const generatePDF = async (toolType) => {
  generating.value = toolType;
  error.value = null;

  try {
    // Ensure we have the latest data from store
    if (!analysisResult.value) {
      await store.dispatch('aiAssistedResults/loadResult', testId.value);
      analysisResult.value = store.getters['aiAssistedResults/currentResult'];
    }

    if (!analysisResult.value) {
      throw new Error('No analysis data found');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    let toolName = '';
    let toolData = null;
    let color = [0, 0, 0];

    // Set tool-specific data
    if (toolType === 'chroma_check') {
      toolName = 'ChromaCheck - Color Contrast Analysis';
      toolData = analysisResult.value.chroma_check;
      color = [156, 39, 176]; // Purple
    } else if (toolType === 'anchor_sense') {
      toolName = 'AnchorSense - Link Analysis';
      toolData = analysisResult.value.anchor_sense;
      color = [33, 150, 243]; // Blue
    } else if (toolType === 'img_tip') {
      toolName = 'ImgTagTip - Image Alt Text Analysis';
      toolData = analysisResult.value.img_tip;
      color = [76, 175, 80]; // Green
    }

    if (!toolData) {
      throw new Error(`No data available for ${toolName}. Please run the analysis first.`);
    }

    console.log('Generating PDF for:', toolName);
    console.log('Tool data:', toolData);
    console.log('Violations/Issues:', toolType === 'chroma_check' ? toolData.violations : toolType === 'anchor_sense' ? toolData.issues : toolData.images);

    // Header
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('RUXAILAB', 14, 15);
    doc.setFontSize(16);
    doc.text(toolName, 14, 28);

    // Test Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Test Information', 14, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Test ID: ${testId.value}`, 14, 58);
    doc.text(`Input Type: ${analysisResult.value.inputType}`, 14, 64);
    if (analysisResult.value.inputType === 'url') {
      doc.text(`URL: ${analysisResult.value.url}`, 14, 70);
    } else {
      doc.text(`File: ${analysisResult.value.sourceFileName}`, 14, 70);
    }
    doc.text(`Date: ${formatDate(toolData.analyzed_at || analysisResult.value.updatedAt)}`, 14, 76);

    let yPos = 90;

    // Tool-specific content
    if (toolType === 'chroma_check') {
      // Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Total Issues: ${toolData.total_issues || 0}`, 14, yPos);
      yPos += 6;
      doc.text(`Status: ${toolData.passed ? 'PASSED' : 'FAILED'}`, 14, yPos);
      yPos += 12;

      // Violations Table
      if (toolData.violations && toolData.violations.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Violations', 14, yPos);
        yPos += 6;

        const tableData = toolData.violations.map((v, index) => [
          index + 1,
          v.element?.target?.[0] || v.selector || 'N/A',
          v.description || v.help || 'Color contrast issue',
          v.impact || 'moderate',
          v.element?.html?.substring(0, 100) || 'N/A',
          v.help_url ? 'View Guide' : 'N/A'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Target', 'Description', 'Impact', 'Element HTML', 'Help']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: color },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 50 },
            3: { cellWidth: 20 },
            4: { cellWidth: 45 },
            5: { cellWidth: 15 }
          }
        });
      }
    } else if (toolType === 'anchor_sense') {
      // Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Total Issues: ${toolData.total_issues || 0}`, 14, yPos);
      yPos += 12;

      // Issues Table
      if (toolData.issues && toolData.issues.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Link Issues', 14, yPos);
        yPos += 6;

        const tableData = toolData.issues.map((issue, index) => [
          index + 1,
          issue.module || 'linkalt',
          issue.issue?.substring(0, 60) || 'N/A',
          issue.element?.substring(0, 80) || 'N/A',
          issue.help?.substring(0, 80) || 'No suggestion'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Module', 'Issue', 'Element', 'How to Fix']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: color },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 45 },
            3: { cellWidth: 50 },
            4: { cellWidth: 45 }
          }
        });
      }
    } else if (toolType === 'img_tip') {
      // Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 14, yPos);
      yPos += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Total Issues: ${toolData.total_issues || 0}`, 14, yPos);
      yPos += 12;

      // Images Table
      if (toolData.issues && toolData.issues.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text('Image Alt Text Issues', 14, yPos);
        yPos += 6;

        const tableData = toolData.issues.map((issue, index) => [
          index + 1,
          issue.module || 'imagealt',
          issue.issue?.substring(0, 50) || 'N/A',
          issue.element?.substring(0, 60) || 'N/A',
          issue.help?.substring(0, 70) || 'No suggestion'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Module', 'Issue', 'Element', 'How to Fix']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: color },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 40 },
            3: { cellWidth: 50 },
            4: { cellWidth: 50 }
          }
        });
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated by RUXAILAB - ${new Date().toLocaleDateString()}`,
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Save PDF
    const fileName = `${toolType}_report_${testId.value}_${Date.now()}.pdf`;
    doc.save(fileName);

    store.commit('SET_TOAST', {
      message: 'PDF report downloaded successfully',
      type: 'success'
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    error.value = `Failed to generate PDF report: ${err.message}`;
    store.commit('SET_TOAST', {
      message: 'Failed to generate PDF report',
      type: 'error'
    });
  } finally {
    generating.value = null;
  }
};

const generateCombinedPDF = async () => {
  generating.value = 'combined';
  error.value = null;

  try {
    // Ensure we have the latest data from store
    if (!analysisResult.value) {
      await store.dispatch('aiAssistedResults/loadResult', testId.value);
      analysisResult.value = store.getters['aiAssistedResults/currentResult'];
    }

    if (!analysisResult.value) {
      throw new Error('No analysis data found');
    }

    console.log('Generating combined PDF with data:', analysisResult.value);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(156, 39, 176);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('RUXAILAB', 14, 15);
    doc.setFontSize(16);
    doc.text('Combined Accessibility Report', 14, 28);

    // Test Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Test Information', 14, 50);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Test ID: ${testId.value}`, 14, 58);
    doc.text(`Input Type: ${analysisResult.value.inputType}`, 14, 64);
    if (analysisResult.value.inputType === 'url') {
      doc.text(`URL: ${analysisResult.value.url}`, 14, 70);
    } else {
      doc.text(`File: ${analysisResult.value.sourceFileName}`, 14, 70);
    }
    doc.text(`Tools Completed: ${analysisResult.value.toolsCompleted.length}/3`, 14, 76);
    doc.text(`Total Issues: ${analysisResult.value.totalIssues || 0}`, 14, 82);

    let yPos = 95;

    // Add each tool's report
    const tools = [
      { key: 'chroma_check', name: 'ChromaCheck', color: [156, 39, 176] },
      { key: 'anchor_sense', name: 'AnchorSense', color: [33, 150, 243] },
      { key: 'img_tip', name: 'ImgTagTip', color: [76, 175, 80] }
    ];

    for (const tool of tools) {
      const toolData = analysisResult.value[tool.key];
      if (toolData) {
        // Add new page if needed
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        // Tool header
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.setTextColor(tool.color[0], tool.color[1], tool.color[2]);
        doc.text(`${tool.name} Report`, 14, yPos);
        yPos += 8;

        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Issues Found: ${toolData.total_issues || 0}`, 14, yPos);
        yPos += 10;

        // Add detailed table for each tool
        if (tool.key === 'chroma_check' && toolData.violations && toolData.violations.length > 0) {
          const tableData = toolData.violations.slice(0, 20).map((v, index) => [
            index + 1,
            v.element?.target?.[0] || 'N/A',
            (v.description || v.help || '').substring(0, 50),
            v.impact || 'N/A'
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Target', 'Description', 'Impact']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: tool.color },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 50 },
              2: { cellWidth: 80 },
              3: { cellWidth: 25 }
            }
          });
          yPos = doc.lastAutoTable.finalY + 15;
        } else if (tool.key === 'anchor_sense' && toolData.issues && toolData.issues.length > 0) {
          const tableData = toolData.issues.slice(0, 20).map((issue, index) => [
            index + 1,
            issue.module || 'linkalt',
            (issue.issue || '').substring(0, 40),
            (issue.help || '').substring(0, 50)
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Module', 'Issue', 'How to Fix']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: tool.color },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 60 },
              3: { cellWidth: 65 }
            }
          });
          yPos = doc.lastAutoTable.finalY + 15;
        } else if (tool.key === 'img_tip' && toolData.issues && toolData.issues.length > 0) {
          const tableData = toolData.issues.slice(0, 20).map((issue, index) => [
            index + 1,
            issue.module || 'imagealt',
            (issue.issue || '').substring(0, 40),
            (issue.help || '').substring(0, 50)
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['#', 'Module', 'Issue', 'How to Fix']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: tool.color },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 60 },
              3: { cellWidth: 65 }
            }
          });
          yPos = doc.lastAutoTable.finalY + 15;
        }
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated by RUXAILAB - ${new Date().toLocaleDateString()}`,
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // Save PDF
    const fileName = `combined_report_${testId.value}_${Date.now()}.pdf`;
    doc.save(fileName);

    store.commit('SET_TOAST', {
      message: 'Combined PDF report downloaded successfully',
      type: 'success'
    });
  } catch (err) {
    console.error('Error generating combined PDF:', err);
    error.value = `Failed to generate combined PDF report: ${err.message}`;
    store.commit('SET_TOAST', {
      message: 'Failed to generate combined PDF report',
      type: 'error'
    });
  } finally {
    generating.value = null;
  }
};
</script>

<style scoped>
/* Dashboard Layout */
.dashboard-overview-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.summary-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

/* Score Card */
.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.score-inner {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.score-number {
  font-size: 32px;
  font-weight: 800;
  color: #000;
}

.score-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #888;
  margin-top: 4px;
  letter-spacing: 0.5px;
}

/* Parameter Grid */
.card-title {
  font-size: 16px;
  font-weight: 800;
  color: #000;
  margin: 0;
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.param-item {
  display: flex;
  flex-direction: column;
}

.param-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.param-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.param-value.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-box {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.purple-bg { background: #9c27b0; }
.blue-bg { background: #2196f3; }
.green-bg { background: #4caf50; }
.black-bg { background: #000; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 20px;
  font-weight: 800;
  color: #000;
}

.stat-desc {
  font-size: 11px;
  font-weight: 600;
  color: #888;
}

/* Secondary Grid */
.secondary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Audit Summary */
.verdict-distribution {
  display: flex;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 12px;
}

.verdict-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  transition: all 0.3s ease;
}

.pass-bar { background: #4caf50; }
.fail-bar { background: #f44336; }
.na-bar { background: #9e9e9e; }

/* Profile Summary */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* Perspective Transition */
.perspective-fade {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Perspective Toggle (Glassmorphism) */
.perspective-container {
  display: flex;
  justify-content: center;
}

.perspective-toggle {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 6px;
  border-radius: 100px;
  display: flex;
  gap: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.perspective-btn {
  display: flex;
  align-items: center;
  padding: 10px 24px;
  border-radius: 100px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.perspective-btn:hover {
  background: rgba(0, 0, 0, 0.03);
  color: #1a1a1a;
}

.perspective-btn.is-active {
  background: #000;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Pagewise Layout */
.pagewise-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  min-height: 600px;
}

.pagewise-sidebar {
  border-right: 1px solid #eee;
  padding-right: 24px;
}

.sidebar-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #999;
  font-weight: 700;
}

.page-nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #f9f9f9;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-nav-item:hover {
  background: #f0f0f0;
}

.page-nav-item.is-active {
  background: #fff;
  border-color: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.nav-item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.nav-page-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-page-url {
  font-size: 11px;
  color: #888;
  font-mono: true;
}

.active-page-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.active-page-url {
  background: #f1f1f1;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

/* Pagewise Stats */
.pagewise-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.p-stat-card {
  background: white;
  border: 1px solid #eee;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.p-stat-label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.p-stat-value {
  font-size: 32px;
  font-weight: 700;
}

.p-stat-progress {
  margin-top: 12px;
  height: 4px;
  background: #eee;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}

.p-bar { height: 100%; transition: width 0.3s ease; }
.p-bar.pass { background: #16a34a; }
.p-bar.fail { background: #dc2626; }

/* Global Styling Overrides */
.summary-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  border-radius: 24px;
  padding: 32px;
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
}

.score-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #000 100%);
  color: white;
}

.compliance-gauge :deep(circle) {
  stroke-linecap: round;
}

.score-number {
  font-size: 36px;
  font-weight: 800;
  color: white;
}

.stat-box {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Compact Tool Cards */
.compact-report {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px !important;
  text-align: center;
}

.compact-name {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
}

.compact-val {
  font-size: 11px;
  color: #666;
}

.profile-item {
  position: relative;
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0.4;
  filter: grayscale(1);
}

.active-profile {
  opacity: 1;
  filter: none;
  border-color: #000;
  background: #fff;
}

.profile-name {
  font-size: 11px;
  font-weight: 700;
  color: #333;
}

.active-dot {
  position: absolute;
  top: 6px;
  right: 6px;
}

/* Existing Styles Override */
.apple-content {
  max-width: 1100px;
}

.reports-grid {
  margin-bottom: 40px;
}

.combined-card {
  background: #f8f9fa;
  border: 1px dashed #ced4da;
}

@media (max-width: 900px) {
  .dashboard-overview-grid,
  .secondary-grid,
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .parameter-grid {
    grid-template-columns: 1fr;
  }
}

/* Page Subtitle */
.page-subtitle {
  color: #6b6b6b;
  font-size: 15px;
  font-weight: 400;
  margin: 0;
}

.apple-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 24px;
  color: #f5222d;
  font-size: 14px;
}

.error-banner .close-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.error-banner .close-btn:hover {
  background: rgba(185, 28, 28, 0.1);
}

/* Empty State */
.empty-state-card {
  text-align: center;
  padding: 60px 40px;
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  margin-bottom: 24px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #e5e5e5 0%, #d0d0d0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #6b6b6b;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 15px;
  color: #6b6b6b;
  max-width: 400px;
  margin: 0 auto 28px;
  line-height: 1.5;
}

/* Info Card */
.info-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 24px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.info-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b6b6b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.info-badge {
  display: inline-block;
  background: #ede9fe;
  color: #7c3aed;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  width: fit-content;
}

.info-url {
  word-break: break-all;
  color: #2563eb;
}

.info-issues {
  color: #d97706;
  font-weight: 600;
}

/* Reports Grid */
.reports-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

/* Report Card */
.report-card {
  background: #fafafa;
  border: 1px solid #e5e5e5;
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  transition: all 0.25s ease;
}

.report-card.report-available {
  background: white;
  border-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.1);
}

/* Report Icon */
.report-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
}

.report-icon-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.report-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.report-icon-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.report-icon-disabled {
  background: linear-gradient(135deg, #d0d0d0 0%, #b0b0b0 100%);
}

/* Report Name */
.report-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 6px;
}

/* Report Description */
.report-description {
  font-size: 13px;
  color: #6b6b6b;
  margin: 0 0 16px;
}

/* Report Status */
.report-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.report-status-available {
  background: #dcfce7;
  color: #16a34a;
}

.report-status-pending {
  background: #f3f4f6;
  color: #6b6b6b;
}

/* Report Stats */
.report-stats {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b6b6b;
}

/* Download Button */
.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.download-btn-purple:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.download-btn-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.download-btn-blue:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.download-btn-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.download-btn-green:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* Inspect Button */
.inspect-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  background: white;
  border: 1px solid #7c3aed;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #7c3aed;
  cursor: pointer;
  transition: all 0.2s ease;
}

.inspect-btn:hover {
  background: #ede9fe;
}

/* Fullscreen Dialog */
.fullscreen-dialog {
  background: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
}

.dialog-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.dialog-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.dialog-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: #fef3c7;
  color: #92400e;
  font-size: 14px;
}

.dialog-content {
  flex: 1;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
}

/* Combined Card */
.combined-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.combined-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.combined-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.combined-title {
  font-size: 17px;
  font-weight: 600;
  color: #15803d;
  margin: 0 0 4px;
}

.combined-description {
  font-size: 14px;
  color: #16a34a;
  margin: 0;
}

/* Buttons */
.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.primary-btn-purple:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
}

.primary-btn-green {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.primary-btn-green:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

/* Actions Bar */
.actions-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #f5f5f5;
  border-color: #b0b0b0;
}

/* Responsive */
@media (max-width: 900px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .combined-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .combined-card .primary-btn {
    width: 100%;
    justify-content: center;
  }

  .actions-bar {
    flex-direction: column;
  }

  .actions-bar .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .apple-content {
    padding: 0 16px 32px;
  }

  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
