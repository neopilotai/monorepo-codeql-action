const CWE_MAPPINGS = {
  // Injection
  'js/injection': ['CWE-89', 'CWE-90', 'CWE-91', 'CWE-93', 'CWE-94', 'CWE-95', 'CWE-96', 'CWE-97', 'CWE-98', 'CWE-99'],
  'js/sql-injection': ['CWE-89', 'CWE-564'],
  'js/code-injection': ['CWE-94', 'CWE-95', 'CWE-96'],
  'js/command-injection': ['CWE-78', 'CWE-88'],
  'js/path-injection': ['CWE-22', 'CWE-23', 'CWE-36', 'CWE-73'],
  'js/eval': ['CWE-94', 'CWE-95', 'CWE-96'],
  'js/static-before-dynamic-members': ['CWE-78'],
  
  // XSS
  'js/xss': ['CWE-79', 'CWE-80', 'CWE-81', 'CWE-82', 'CWE-83', 'CWE-84', 'CWE-85', 'CWE-86', 'CWE-87'],
  'js/dom-xss': ['CWE-79'],
  'js/client-side-unvalidated-url-redirection': ['CWE-601'],
  'js/reflected-xss': ['CWE-79'],
  'js/stored-xss': ['CWE-79'],
  
  // Path Traversal
  'js/path-traversal': ['CWE-22', 'CWE-23', 'CWE-36', 'CWE-73'],
  'js/unsafe-file-access': ['CWE-22', 'CWE-73'],
  
  // Authentication & Session
  'js/weak-cryptography': ['CWE-310', 'CWE-311', 'CWE-312', 'CWE-319', 'CWE-326', 'CWE-327'],
  'js/insufficient-randomness': ['CWE-331', 'CWE-338', 'CWE-340'],
  'js/hardcoded-credentials': ['CWE-259', 'CWE-321', 'CWE-798'],
  'js/disabled-crypto': ['CWE-327'],
  'js/weak-certificate-validation': ['CWE-295', 'CWE-296', 'CWE-297', 'CWE-298'],
  
  // Input Validation
  'js/missing-input-validation': ['CWE-20', 'CWE-128', 'CWE-129', 'CWE-130'],
  'js/improper-input-validation': ['CWE-20', 'CWE-128'],
  'js/regular-expression-denial-of-service': ['CWE-1333'],
  
  // Information Disclosure
  'js/exposed-sensitive-data': ['CWE-200', 'CWE-201', 'CWE-209', 'CWE-216', 'CWE-550', 'CWE-552'],
  'js/stack-trace-exposure': ['CWE-209', 'CWE-248'],
  'js/path-disclosure': ['CWE-200'],
  'js/clear-text-logging': ['CWE-312', 'CWE-532'],
  
  // Authorization
  'js/missing-authorization': ['CWE-862', 'CWE-863'],
  'js/incorrect-authorization': ['CWE-639', 'CWE-284'],
  'js/client-side-url-redirection': ['CWE-601'],
  
  // Code Quality
  'js/unused-variable': ['CWE-398', 'CWE-563'],
  'js/unreachable-code': ['CWE-398', 'CWE-561'],
  'js/useless-assignment': ['CWE-398', 'CWE-563'],
  'js/dead-code': ['CWE-398', 'CWE-561'],
  
  // Prototype Pollution
  'js/prototype-pollution': ['CWE-1321', 'CWE-1419', 'CWE-1420'],
  
  // Denial of Service
  'js/denial-of-service': ['CWE-400', 'CWE-1059', 'CWE-1333'],
  'js/resource-exhaustion': ['CWE-400', 'CWE-770', 'CWE-771', 'CWE-772'],
  
  // Deserialization
  'js/unsafe-jquery-plugin': ['CWE-502', 'CWE-503'],
  'js/deserialization': ['CWE-502'],
  
  // Type Confusion
  'js/type-confusion': ['CWE-704', 'CWE-843'],
  
  // Timing Attack
  'js/insufficient-timing-protection': ['CWE-208', 'CWE-362'],
  
  // Server-Side Request Forgery
  'js/request-splitting': ['CWE-113', 'CWE-444'],
  'js/ssrf': ['CWE-918'],
  
  // Cryptography
  'js/broken-crypto': ['CWE-310', 'CWE-327', 'CWE-331', 'CWE-338'],
  'js/insufficient-key-size': ['CWE-326'],
  'js/constant-prng': ['CWE-331', 'CWE-338'],
  
  // HTML/Template Injection
  'js/html-constructed-from-input': ['CWE-79', 'CWE-95'],
  'js/template-injection': ['CWE-94', 'CWE-95', 'CWE-96'],
  
  // Leftover Debug Code
  'js/console-logging': ['CWE-489', 'CWE-532'],
  'js/debugger-statement': ['CWE-489'],
  
  // Unvalidated Redirect
  'js/unvalidated-redirect': ['CWE-601'],
  'js/open-redirect': ['CWE-601'],
  
  // CodeQL Java/Kotlin/C# specifics
  'java/sql-injection': ['CWE-89', 'CWE-564'],
  'java/command-injection': ['CWE-78', 'CWE-88'],
  'java/path-traversal': ['CWE-22', 'CWE-23', 'CWE-36'],
  'java/xxe': ['CWE-611', 'CWE-827'],
  'java/deserialization': ['CWE-502'],
  'java/stack-trace-exposure': ['CWE-209'],
  'java/hardcoded-credential': ['CWE-259', 'CWE-321', 'CWE-798'],
  'java/weak-crypto': ['CWE-310', 'CWE-327', 'CWE-331'],
  'java/unsafe-reflection': ['CWE-470'],
  'java/missing-validation': ['CWE-20', 'CWE-128'],
  
  'kotlin/sql-injection': ['CWE-89', 'CWE-564'],
  'kotlin/command-injection': ['CWE-78', 'CWE-88'],
  'kotlin/path-traversal': ['CWE-22', 'CWE-23'],
  'kotlin/deserialization': ['CWE-502'],
  
  'cs/sql-injection': ['CWE-89', 'CWE-564'],
  'cs/path-traversal': ['CWE-22', 'CWE-23'],
  'cs/weak-crypto': ['CWE-310', 'CWE-327'],
  'cs/deserialization': ['CWE-502'],
  
  // Python
  'py/sql-injection': ['CWE-89', 'CWE-564'],
  'py/command-injection': ['CWE-78', 'CWE-88'],
  'py/path-traversal': ['CWE-22', 'CWE-23'],
  'py/unsafe-pickling': ['CWE-502'],
  'py/clear-text-storage-sensitive-data': ['CWE-312'],
  'py/hardcoded-credentials': ['CWE-259', 'CWE-321', 'CWE-798'],
  'py/weak-crypto': ['CWE-310', 'CWE-327'],
  
  // Go
  'go/sql-injection': ['CWE-89', 'CWE-564'],
  'go/command-injection': ['CWE-78', 'CWE-88'],
  'go/path-traversal': ['CWE-22', 'CWE-23'],
  'go/unsafe-deserialization': ['CWE-502'],
  'go/weak-crypto': ['CWE-310', 'CWE-327'],
  'go/hardcoded-credentials': ['CWE-259', 'CWE-321', 'CWE-798'],
  
  // Ruby
  'ruby/sql-injection': ['CWE-89', 'CWE-564'],
  'ruby/command-injection': ['CWE-78', 'CWE-88'],
  'ruby/deserialization': ['CWE-502'],
  
  // PHP
  'php/sql-injection': ['CWE-89', 'CWE-564'],
  'php/command-injection': ['CWE-78', 'CWE-88'],
  'php/path-traversal': ['CWE-22', 'CWE-23'],
  'php/unsafe-deserialization': ['CWE-502'],
  'php/weak-crypto': ['CWE-310', 'CWE-327'],
  'php/xss': ['CWE-79'],
  
  // CPP
  'cpp/unsafe-arithmetic': ['CWE-190', 'CWE-191', 'CWE-192', 'CWE-193', 'CWE-194', 'CWE-195', 'CWE-196', 'CWE-197'],
  'cpp/buffer-overflow': ['CWE-119', 'CWE-120', 'CWE-121', 'CWE-122', 'CWE-123', 'CWE-124', 'CWE-125', 'CWE-126', 'CWE-127'],
  'cpp/memory-leak': ['CWE-401', 'CWE-772'],
  'cpp/use-after-free': ['CWE-416'],
  'cpp/null-dereference': ['CWE-476', 'CWE-690'],
  'cpp/format-string': ['CWE-134', 'CWE-427'],
  'cpp/weak-crypto': ['CWE-310', 'CWE-327'],
  'cpp/unchecked-return': ['CWE-252', 'CWE-253', 'CWE-254', 'CWE-255', 'CWE-256', 'CWE-257', 'CWE-258', 'CWE-259'],
  
  // Swift
  'swift/sql-injection': ['CWE-89', 'CWE-564'],
  'swift/command-injection': ['CWE-78', 'CWE-88'],
  'swift/weak-crypto': ['CWE-310', 'CWE-327'],
  
  // Rust
  'rust/unsafe-arithmetic': ['CWE-190', 'CWE-191'],
  'rust/weak-crypto': ['CWE-310', 'CWE-327'],
  'rust/permission-privilege-confusion': ['CWE-269', 'CWE-284'],
};

const CWE_CATEGORIES = {
  'CWE-89': { name: 'SQL Injection', category: 'Injection', severity: 'high' },
  'CWE-79': { name: 'Cross-site Scripting (XSS)', category: 'XSS', severity: 'high' },
  'CWE-22': { name: 'Path Traversal', category: 'Path Traversal', severity: 'high' },
  'CWE-78': { name: 'OS Command Injection', category: 'Injection', severity: 'critical' },
  'CWE-94': { name: 'Code Injection', category: 'Injection', severity: 'critical' },
  'CWE-502': { name: 'Deserialization of Untrusted Data', category: 'Deserialization', severity: 'critical' },
  'CWE-310': { name: 'Cryptographic Issues', category: 'Cryptography', severity: 'high' },
  'CWE-327': { name: 'Use of Weak Cryptographic Algorithm', category: 'Cryptography', severity: 'high' },
  'CWE-312': { name: 'Cleartext Storage of Sensitive Information', category: 'Sensitive Data', severity: 'high' },
  'CWE-798': { name: 'Use of Hard-coded Credentials', category: 'Authentication', severity: 'critical' },
  'CWE-601': { name: 'URL Redirection to Untrusted Site', category: 'Redirect', severity: 'medium' },
  'CWE-20': { name: 'Improper Input Validation', category: 'Input Validation', severity: 'high' },
  'CWE-119': { name: 'Buffer Overflow', category: 'Buffer Error', severity: 'critical' },
  'CWE-400': { name: 'Resource Exhaustion', category: 'Denial of Service', severity: 'medium' },
  'CWE-200': { name: 'Exposure of Sensitive Information', category: 'Information Disclosure', severity: 'medium' },
  'CWE-862': { name: 'Missing Authorization', category: 'Authorization', severity: 'high' },
  'CWE-1321': { name: 'Prototype Pollution', category: 'Prototype Pollution', severity: 'high' },
  'CWE-1333': { name: 'Regular Expression Denial of Service', category: 'Denial of Service', severity: 'medium' },
  'CWE-476': { name: 'NULL Pointer Dereference', category: 'NULL Pointer', severity: 'medium' },
  'CWE-209': { name: 'Information Exposure Through Error Message', category: 'Information Disclosure', severity: 'medium' },
  'CWE-295': { name: 'Improper Certificate Validation', category: 'Cryptography', severity: 'high' },
  'CWE-331': { name: 'Insufficient Entropy', category: 'Cryptography', severity: 'medium' },
  'CWE-259': { name: 'Use of Hard-coded Password', category: 'Credentials', severity: 'critical' },
  'CWE-564': { name: 'SQL Injection through Hibernate', category: 'Injection', severity: 'high' },
  'CWE-611': { name: 'XML External Entity (XXE)', category: 'XXE', severity: 'high' },
  'CWE-918': { name: 'Server-Side Request Forgery (SSRF)', category: 'SSRF', severity: 'high' },
  'CWE-470': { name: 'Unsafe Reflection', category: 'Reflection', severity: 'high' },
  'CWE-416': { name: 'Use After Free', category: 'Memory', severity: 'critical' },
  'CWE-190': { name: 'Integer Overflow', category: 'Numeric Errors', severity: 'high' },
  'CWE-401': { name: 'Memory Leak', category: 'Memory', severity: 'medium' },
  'CWE-639': { name: 'Insecure Authorization', category: 'Authorization', severity: 'high' },
  'CWE-248': { name: 'Uncaught Exception', category: 'Error Handling', severity: 'medium' },
  'CWE-284': { name: 'Improper Access Control', category: 'Access Control', severity: 'critical' },
  'CWE-363': { name: 'Race Condition', category: 'Race Condition', severity: 'high' },
  'CWE-434': { name: 'Unrestricted File Upload', category: 'File Handling', severity: 'high' },
  'CWE-352': { name: 'Cross-Site Request Forgery (CSRF)', category: 'CSRF', severity: 'high' },
  'CWE-346': { name: 'Origin Validation Error', category: 'CSRF', severity: 'medium' },
  'CWE-444': { name: 'HTTP Request Smuggling', category: 'HTTP', severity: 'high' },
  'CWE-113': { name: 'HTTP Response Splitting', category: 'HTTP', severity: 'high' },
};

function getCWEForRule(ruleId) {
  const lowerRuleId = ruleId.toLowerCase();
  
  // Direct match
  if (CWE_MAPPINGS[lowerRuleId]) {
    return CWE_MAPPINGS[lowerRuleId];
  }
  
  // Partial match
  for (const [pattern, cweIds] of Object.entries(CWE_MAPPINGS)) {
    if (lowerRuleId.includes(pattern) || pattern.includes(lowerRuleId.replace(/^(js|java|py|go|cs|cpp|swift|ruby|php|kotlin|ts)-/, ''))) {
      return cweIds;
    }
  }
  
  return [];
}

function getCWEDetails(cweId) {
  return CWE_CATEGORIES[cweId] || { name: 'Unknown', category: 'Unknown', severity: 'unknown' };
}

function getCWEByCategory() {
  const categories = {};
  
  for (const [cweId, details] of Object.entries(CWE_CATEGORIES)) {
    if (!categories[details.category]) {
      categories[details.category] = [];
    }
    categories[details.category].push({
      id: cweId,
      name: details.name,
      severity: details.severity
    });
  }
  
  return categories;
}

module.exports = {
  CWE_MAPPINGS,
  CWE_CATEGORIES,
  getCWEForRule,
  getCWEDetails,
  getCWEByCategory
};
