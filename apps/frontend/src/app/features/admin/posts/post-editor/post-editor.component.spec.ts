import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { of } from "rxjs";
import {
  render,
  screen,
  waitFor,
  RenderResult,
  fireEvent,
} from "@testing-library/angular";
import userEvent from "@testing-library/user-event";

import { PostEditorComponent } from "./post-editor.component";
import {
  ApiService,
  CreatePostDto,
  BlogPost,
  Category,
  Tag,
} from "../../../../core/services/api.service";
import { FileUploadService } from "../../../../core/services/file-upload.service";
import { FileUploadComponent } from "../../../../shared/components/file-upload/file-upload.component";

interface RenderPostEditorOptions {
  imports?: any[];
  providers?: any[];
  excludeHttpClient?: boolean;
  mockActivatedRoute?: any;
  apiService?: jest.Mocked<ApiService>;
  router?: jest.Mocked<Router>;
}

async function renderPostEditor(
  options: RenderPostEditorOptions = {},
  mockServices: {
    apiService: jest.Mocked<ApiService>;
    router: jest.Mocked<Router>;
    activatedRoute: any;
    fileUploadService: jest.Mocked<FileUploadService>;
  }
): Promise<RenderResult<PostEditorComponent, PostEditorComponent>> {
  // Import InputComponent and TextareaComponent from shared ui
  const { InputComponent } = await import(
    "../../../../shared/ui/input.component"
  );
  const { TextareaComponent } = await import(
    "../../../../shared/ui/textarea.component"
  );

  const defaultImports = [
    ReactiveFormsModule,
    FileUploadComponent,
    InputComponent,
    TextareaComponent,
  ];
  const defaultProviders = [
    provideHttpClient(),
    provideHttpClientTesting(),
    { provide: ApiService, useValue: mockServices.apiService },
    { provide: Router, useValue: mockServices.router },
    {
      provide: ActivatedRoute,
      useFactory: () =>
        options.mockActivatedRoute || mockServices.activatedRoute,
    },
    { provide: FileUploadService, useValue: mockServices.fileUploadService },
    {
      provide: HttpClient,
      useValue: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      },
    },
  ];

  return render(PostEditorComponent, {
    imports: [...defaultImports, ...(options.imports || [])],
    providers: [...defaultProviders, ...(options.providers || [])],
  });
}

describe("PostEditorComponent", () => {
  let mockApiService: jest.Mocked<ApiService>;
  let mockRouter: jest.Mocked<Router>;
  let mockActivatedRoute: any;
  let mockFileUploadService: jest.Mocked<FileUploadService>;

  // Mock data
  const mockCategories: Category[] = [
    {
      id: "1",
      name: "Technology",
      slug: "technology",
      description: "Tech related posts",
      color: "#blue",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Science",
      slug: "science",
      description: "Science related posts",
      color: "#green",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTags: Tag[] = [
    {
      id: "1",
      name: "JavaScript",
      slug: "javascript",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Angular",
      slug: "angular",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockCreatedPost: BlogPost = {
    id: "123",
    title: "Test Blog Post",
    slug: "test-blog-post",
    content: "This is test content",
    excerpt: "Test excerpt",
    featuredImage: undefined,
    published: false,
    publishedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    metaTitle: "Test Meta Title",
    metaDescription: "Test meta description",
    authorId: "author-1",
    categoryId: "1",
    author: {
      id: "author-1",
      email: "test@example.com",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      role: "AUTHOR",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    category: mockCategories[0],
    tags: [mockTags[0]],
  };

  beforeEach(() => {
    // Create mocks for services
    mockFileUploadService = {
      uploadFile: jest
        .fn()
        .mockReturnValue(of({ url: "http://example.com/image.jpg" })),
      uploadFileWithProgress: jest
        .fn()
        .mockReturnValue(
          of({ progress: 100, url: "http://example.com/image.jpg" })
        ),
      validateFile: jest.fn().mockReturnValue(true),
      createPreviewUrl: jest.fn().mockReturnValue("blob://test-url"),
      revokePreviewUrl: jest.fn(),
      extractFilenameFromUrl: jest.fn().mockReturnValue("image.jpg"),
      extractCategoryFromUrl: jest.fn().mockReturnValue("uploads"),
      deleteFile: jest.fn().mockReturnValue(of(true)),
      replaceFile: jest
        .fn()
        .mockReturnValue(of({ url: "http://example.com/image.jpg" })),
      getFileInfo: jest
        .fn()
        .mockReturnValue(
          of({ filename: "image.jpg", url: "http://example.com/image.jpg" })
        ),
      getFileUrl: jest.fn().mockReturnValue("http://example.com/image.jpg"),
      buildUploadUrl: jest.fn().mockReturnValue("http://example.com/upload"),
      buildDeleteUrl: jest.fn().mockReturnValue("http://example.com/delete"),
      buildReplaceUrl: jest.fn().mockReturnValue("http://example.com/replace"),
      buildGetFileUrl: jest.fn().mockReturnValue("http://example.com/file"),
      buildGetFileInfoUrl: jest.fn().mockReturnValue("http://example.com/info"),
      getServeUrl: jest.fn().mockReturnValue("http://example.com/serve"),
      uploadProfilePicture: jest
        .fn()
        .mockReturnValue(of({ url: "http://example.com/profile.jpg" })),
      uploadBlogImage: jest
        .fn()
        .mockReturnValue(of({ url: "http://example.com/blog.jpg" })),
      uploadSettingsImage: jest
        .fn()
        .mockReturnValue(of({ url: "http://example.com/settings.jpg" })),
    } as unknown as jest.Mocked<FileUploadService>;

    mockApiService = {
      createPost: jest.fn(),
      getCategories: jest.fn(),
      getTags: jest.fn(),
      getPost: jest.fn(),
      updatePost: jest.fn(),
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    mockActivatedRoute = {
      params: of({}), // No ID means creating new post
    };

    // Setup API service mocks
    (mockApiService.getCategories as jest.Mock).mockReturnValue(
      of(mockCategories)
    );
    (mockApiService.getTags as jest.Mock).mockReturnValue(of(mockTags));
    (mockApiService.createPost as jest.Mock).mockReturnValue(
      of(mockCreatedPost)
    );
  });

  it.skip("should render the component and display Create New Post header", async () => {
    await renderPostEditor(
      {},
      {
        apiService: mockApiService,
        router: mockRouter,
        activatedRoute: mockActivatedRoute,
        fileUploadService: mockFileUploadService,
      }
    );

    expect(screen.getByText("Create New Post")).toBeInTheDocument();
    expect(mockApiService.getCategories).toHaveBeenCalled();
    expect(mockApiService.getTags).toHaveBeenCalled();
  });

  it.skip("should display form fields with proper labels for accessibility", async () => {
    await renderPostEditor(
      {},
      {
        apiService: mockApiService,
        router: mockRouter,
        activatedRoute: mockActivatedRoute,
        fileUploadService: mockFileUploadService,
      }
    );

    // Check for accessible form labels
    expect(screen.getByRole("textbox", { name: /^Title/ })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /content/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /excerpt/i })
    ).toBeInTheDocument();
  });

  describe("Blog Post Creation with User Interactions", () => {
    it.skip("should create a new blog post successfully through user interactions", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      // User fills in the form using accessible interactions
      const titleInput = screen.getByRole("textbox", { name: /^Title/ });
      const contentTextarea = screen.getByRole("textbox", { name: /content/i });
      const excerptTextarea = screen.getByRole("textbox", { name: /excerpt/i });

      await user.type(titleInput, "Test Blog Post");
      await user.type(
        contentTextarea,
        "This is test content for the blog post"
      );
      await user.type(excerptTextarea, "Test excerpt");

      // User selects a category
      const categorySelect = screen.getByDisplayValue("Select a category");
      await user.selectOptions(categorySelect, "1");

      // User selects tags using checkboxes
      const jsTagCheckbox = screen.getByLabelText("JavaScript");
      await user.click(jsTagCheckbox);

      // User fills SEO fields
      const metaTitleInput = screen.getByPlaceholderText(
        "SEO title (60 chars max)"
      );
      const metaDescriptionTextarea = screen.getByPlaceholderText(
        "SEO description (160 chars max)"
      );
      await user.type(metaTitleInput, "Test Meta Title");
      await user.type(metaDescriptionTextarea, "Test meta description");

      // User saves as draft
      const saveAsDraftButton = screen.getByText("Save as Draft");
      await user.click(saveAsDraftButton);

      await waitFor(() => {
        expect(mockApiService.createPost).toHaveBeenCalledWith({
          title: "Test Blog Post",
          content: "This is test content for the blog post",
          excerpt: "Test excerpt",
          featuredImage: undefined,
          published: false,
          publishedAt: undefined,
          metaTitle: "Test Meta Title",
          metaDescription: "Test meta description",
          categoryId: "1",
          tagIds: ["1"],
        });
      });
    });

    it.skip("should publish a blog post when user clicks Publish Post", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      // User fills required fields
      const titleInput = screen.getByRole("textbox", { name: /^Title/ });
      const contentTextarea = screen.getByRole("textbox", { name: /content/i });

      await user.type(titleInput, "Published Post");
      await user.type(contentTextarea, "This post will be published");

      // User clicks publish
      const publishButton = screen.getByText("Publish Post");
      await user.click(publishButton);

      await waitFor(() => {
        const createPostCall = (mockApiService.createPost as jest.Mock).mock
          .calls[0];
        const postData = createPostCall[0] as CreatePostDto;

        expect(postData.published).toBeTruthy();
        expect(postData.title).toBe("Published Post");
        expect(postData.content).toBe("This post will be published");
      });
    });

    it.skip("should handle tag selection through checkbox interactions", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      // User selects multiple tags
      const jsTagCheckbox = screen.getByLabelText("JavaScript");
      const angularTagCheckbox = screen.getByLabelText("Angular");

      await user.click(jsTagCheckbox);
      await user.click(angularTagCheckbox);

      expect(jsTagCheckbox).toBeChecked();
      expect(angularTagCheckbox).toBeChecked();

      // User deselects a tag
      await user.click(jsTagCheckbox);

      expect(jsTagCheckbox).not.toBeChecked();
      expect(angularTagCheckbox).toBeChecked();
    });

    it.skip("should show success message after successful creation", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      const titleInput = screen.getByRole("textbox", { name: /^Title/ });
      const contentTextarea = screen.getByRole("textbox", { name: /content/i });

      await user.type(titleInput, "Success Test Post");
      await user.type(contentTextarea, "This should succeed");

      const publishButton = screen.getByText("Publish Post");
      await user.click(publishButton);

      await waitFor(() => {
        expect(
          screen.getByText("Post created successfully!")
        ).toBeInTheDocument();
      });
    });

    it.skip("should handle API errors gracefully and show error message", async () => {
      const user = userEvent.setup();

      // Mock API error
      (mockApiService.createPost as jest.Mock).mockRejectedValue({
        error: { message: "Server error" },
      });

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      const titleInput = screen.getByRole("textbox", { name: /^Title/ });
      const contentTextarea = screen.getByRole("textbox", { name: /content/i });

      await user.type(titleInput, "Error Test Post");
      await user.type(contentTextarea, "This should fail");

      const publishButton = screen.getByText("Publish Post");
      await user.click(publishButton);

      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it.skip("should navigate when user clicks cancel", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockRouter.navigate).toHaveBeenCalledWith(["/admin/posts"]);
    });
  });

  describe("Form Validation with User Interactions", () => {
    it.skip("should show validation error when user leaves title field empty", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      const titleInput = screen.getByRole("textbox", { name: /^Title/ });

      // User clicks into field then leaves it empty (focus and blur)
      await user.click(titleInput);
      await user.tab(); // Move focus away

      await waitFor(() => {
        expect(screen.getByText("title is required")).toBeInTheDocument();
      });
    });

    it.skip("should show validation error when user leaves content field empty", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      const contentTextarea = screen.getByRole("textbox", { name: /content/i });

      // User clicks into field then leaves it empty
      await user.click(contentTextarea);
      await user.tab(); // Move focus away

      await waitFor(() => {
        expect(screen.getByText("content is required")).toBeInTheDocument();
      });
    });

    it.skip("should validate maximum title length when user types too much", async () => {
      const user = userEvent.setup();

      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      const titleInput = screen.getByRole("textbox", { name: /^Title/ });
      const longTitle = "a".repeat(201); // Exceeds 200 char limit

      await user.type(titleInput, longTitle);
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText("title is too long")).toBeInTheDocument();
      });
    });

    it.skip("should prevent form submission when validation fails", async () => {
      await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      // User tries to publish without filling required fields
      const publishButton = screen.getByText("Publish Post");
      expect(publishButton).toBeDisabled();

      // Verify API is not called
      expect(mockApiService.createPost).not.toHaveBeenCalled();
    });

    it("should enable submit button when form is valid", async () => {
      const user = userEvent.setup();

      const { fixture } = await renderPostEditor(
        {},
        {
          apiService: mockApiService,
          router: mockRouter,
          activatedRoute: mockActivatedRoute,
          fileUploadService: mockFileUploadService,
        }
      );

      const titleInput = screen.getByRole("textbox", { name: /^Title/i });
      const contentTextarea = screen.getByRole("textbox", {
        name: /^Content/i,
      });

      const publishButton = screen.getByText("Publish Post");

      // Initially disabled due to empty required fields
      expect(publishButton).toBeDisabled();

      // Wait for form initialization
      await waitFor(() => {
        expect(fixture.componentInstance.postForm).toBeDefined();
      });

      // Type in the fields
      await user.type(titleInput, "Valid Title");

      await user.type(contentTextarea, "Valid content");
      // Force change detection
      fixture.detectChanges();

      // Wait for form control updates and validate
      await waitFor(() => {
        const component = fixture.componentInstance;
        const form = component.postForm;

        expect(form.get("title")?.value).toBe("Valid Title");
        expect(form.get("content")?.value).toBe("Valid content");
        expect(form.valid).toBe(true);
        expect(publishButton).toBeEnabled();
      });
    });
  });
});
