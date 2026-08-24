export type EntityType =
  | 'Namespace'
  | 'Class'
  | 'Interface'
  | 'Struct'
  | 'Enum'
  | 'Record'
  | 'Method'
  | 'Property'
  | 'Field'
  | 'Controller'
  | 'Service'
  | 'Repository'
  | 'Model'
  | 'DTO'
  | 'Entity'
  | 'Middleware'
  | 'Worker'
  | 'Consumer'
  | 'Producer'
  | 'Configuration';

export type RelationshipType =
  | 'Contains'
  | 'Calls'
  | 'Implements'
  | 'Inherits'
  | 'DependsOn'
  | 'Exposes'
  | 'Consumes'
  | 'Publishes'
  | 'ReadsFrom'
  | 'WritesTo'
  | 'Uses'
  | 'ConfiguredBy'
  | 'TestedBy'
  | 'ModifiedBy'
  | 'PartOf';

export enum RepositorySource {
  Local = 0,
  GitHub = 1,
}

export enum ExtractionStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Failed = 3,
}

export enum SeverityLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

export interface RepositoryInfo {
  id: string;
  name: string;
  rootPath: string;
  source: RepositorySource;
  branch: string;
  commitHash: string;
  lastCommitMessage: string;
  lastCommitAuthor: string;
  lastIndexedAt?: string;
  status: ExtractionStatus;
  languages: string[];
  techStack: string[];
  errorMessage?: string;
}

export interface CodeEntity {
  id: string;
  repositoryId: string;
  name: string;
  fullName: string;
  namespace: string;
  filePath: string;
  startLine: number;
  endLine: number;
  type: EntityType;
  language: string;
  docComment?: string;
  attributes: string[];
  metadata?: Record<string, string>;
}

export interface CodeRelationship {
  id: string;
  repositoryId: string;
  sourceEntityId: string;
  sourceFullName: string;
  targetEntityId?: string;
  targetFullName: string;
  type: RelationshipType;
  context?: string;
  filePath?: string;
  lineNumber?: number;
}

export interface ApiDefinition {
  id: string;
  repositoryId: string;
  route: string;
  httpMethod: string;
  controllerName: string;
  actionName: string;
  requestModel?: string;
  responseModel?: string;
  filePath: string;
  lineNumber: number;
}

export interface DatabaseReference {
  id: string;
  repositoryId: string;
  tableName: string;
  operation: string;
  ormProvider: string;
  sourceEntity: string;
  filePath: string;
  lineNumber: number;
}

export interface EventDefinition {
  id: string;
  repositoryId: string;
  eventName: string;
  messageType: string;
  role: string;
  broker: string;
  handlerName: string;
  filePath: string;
  lineNumber: number;
}

export interface PackageDependency {
  id: string;
  repositoryId: string;
  packageName: string;
  version: string;
  ecosystem: string;
  filePath: string;
}

export interface FunctionalFlowStep {
  stepNumber: number;
  nodeName: string;
  nodeType: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
}

export interface FunctionalFlow {
  id: string;
  repositoryId: string;
  title: string;
  description: string;
  triggerApi: string;
  steps: FunctionalFlowStep[];
  mermaidMarkup: string;
}

export interface SecurityVulnerability {
  id: string;
  packageName: string;
  version: string;
  cveId: string;
  severity: SeverityLevel;
  summary: string;
  recommendation: string;
  filePath: string;
}

export interface SecretLeak {
  id: string;
  secretType: string;
  maskedValue: string;
  filePath: string;
  lineNumber: number;
  severity: SeverityLevel;
}

export interface OwaspApiViolation {
  id: string;
  route: string;
  httpMethod: string;
  ruleId: string;
  description: string;
  filePath: string;
  lineNumber: number;
}

export interface SecurityAuditResult {
  repositoryId: string;
  securityScore: number;
  vulnerabilities: SecurityVulnerability[];
  secretLeaks: SecretLeak[];
  owaspViolations: OwaspApiViolation[];
}

export interface CrossRepoDependency {
  id: string;
  sourceRepoId: string;
  sourceRepoName: string;
  sourceComponent: string;
  targetRepoId: string;
  targetRepoName: string;
  targetComponent: string;
  dependencyType: string;
  protocol: string;
  context: string;
}

export interface WorkspaceMeshSummary {
  totalRepositories: number;
  totalCrossRepoDependencies: number;
  dependencies: CrossRepoDependency[];
  repositories: RepositoryInfo[];
}

export interface AffectedComponentInfo {
  name: string;
  type: string;
  filePath: string;
  context: string;
}

export interface BlastRadiusResult {
  targetEntityName: string;
  impactScore: number;
  riskLevel: string;
  affectedControllers: AffectedComponentInfo[];
  affectedServices: AffectedComponentInfo[];
  affectedRepositories: AffectedComponentInfo[];
  affectedDatabases: AffectedComponentInfo[];
  affectedCrossRepoServices: AffectedComponentInfo[];
}

export interface BranchDiffResult {
  sourceBranch: string;
  targetBranch: string;
  addedApis: ApiDefinition[];
  removedApis: ApiDefinition[];
  addedEntities: CodeEntity[];
  removedEntities: CodeEntity[];
  newViolationsIntroduced: CodeRelationship[];
}

export interface DatabaseTableColumn {
  columnName: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface DatabaseTableSchema {
  tableName: string;
  ormProvider: string;
  columns: DatabaseTableColumn[];
}

export interface DatabaseErdResult {
  totalTables: number;
  mermaidErdMarkup: string;
  tables: DatabaseTableSchema[];
}

export interface ContainerServiceInfo {
  serviceName: string;
  image: string;
  ports: string[];
  environmentVariables: string[];
  sourceFile: string;
}

export interface InfrastructureTopology {
  dockerfilesCount: number;
  k8sManifestsCount: number;
  containerServices: ContainerServiceInfo[];
}

export interface ArchitectureHandbook {
  repositoryName: string;
  generatedAt: string;
  markdownContent: string;
}

export interface ArchitectureSummary {
  repository: string;
  controllers: number;
  services: number;
  repositories: number;
  violations: CodeRelationship[];
  architecturePattern: string;
}

export interface AnalysisResult {
  repository: RepositoryInfo;
  entities: CodeEntity[];
  relationships: CodeRelationship[];
  apis: ApiDefinition[];
  databases: DatabaseReference[];
  events: EventDefinition[];
  packages: PackageDependency[];
  flows: FunctionalFlow[];
  securityAudit: SecurityAuditResult;
  recentCommits: any[];
  parsingErrors: string[];
}

export interface ScanLocalRequest {
  path: string;
}

export interface ScanGitHubRequest {
  url: string;
  branch?: string;
  commit?: string;
  accessToken?: string;
}

export interface CodeRunnerDetectionResult {
  language: string;
  framework: string;
  entryPointFile: string;
  recommendedCommand: string;
  availableCommands: string[];
  requiresBuild: boolean;
}

export interface ExecuteCodeRequest {
  customCommand?: string;
  workingDirectory?: string;
  timeoutSeconds?: number;
}

export interface CodeRunnerExecutionResult {
  processId: string;
  commandExecuted: string;
  status: string;
  exitCode: number;
  executionDurationMs: number;
  terminalOutput: string;
  standardError: string;
}
