import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: {
    postTags: number;
  };
}

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}

@Injectable({
  providedIn: "root",
})
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tags`;

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  getTagById(id: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/${id}`);
  }

  getTagBySlug(slug: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.apiUrl}/slug/${slug}`);
  }

  createTag(tagData: CreateTagDto): Observable<Tag> {
    return this.http.post<Tag>(this.apiUrl, tagData);
  }

  updateTag(id: string, tagData: UpdateTagDto): Observable<Tag> {
    return this.http.patch<Tag>(`${this.apiUrl}/${id}`, tagData);
  }

  deleteTag(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
