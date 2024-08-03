export interface PodcastSegment {
  host: string;
  guest: string;
}

export interface GeneratePodcastResponse {
  script: PodcastSegment[];
  audioUrl: string;
  title: string;
}

export interface Podcast {
  id: string;
  script: PodcastSegment[];
  audioUrl: string;
  title: string;
  timestamp: { seconds: number; nanoseconds: number };
}
