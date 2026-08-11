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

export interface GitCommitInfo {
  commitHash: string;
  author: string;
  message: string;
  committedAt: string;
  modifiedFiles: string[];
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
  recentCommits: GitCommitInfo[];
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
