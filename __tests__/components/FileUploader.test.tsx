import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import FileUploader from "@/components/shared/FileUploader";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";

// Mock dependencies
vi.mock("react-dropzone", () => ({
  useDropzone: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: vi.fn(({ children, onClick, type, variant }) => (
    <button
      onClick={onClick}
      type={type}
      data-testid="upload-button"
      data-variant={variant}
    >
      {children}
    </button>
  )),
}));

vi.mock("lucide-react", () => ({
  ImagePlus: vi.fn(({ width, height }) => (
    <div data-testid="image-plus-icon" data-width={width} data-height={height}>
      ImagePlus
    </div>
  )),
}));

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mocked-blob-url");
global.URL.revokeObjectURL = vi.fn();

// Type assertions for mocked functions
const mockUseDropzone = useDropzone as any;
const mockUseTranslation = useTranslation as any;

describe("FileUploader Component", () => {
  const mockFieldChange = vi.fn();
  const mockT = vi.fn((key) => key);
  const mockGetRootProps = vi.fn(() => ({ "data-testid": "dropzone-root" }));
  const mockGetInputProps = vi.fn(() => ({ "data-testid": "dropzone-input" }));

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: mockT });
    mockUseDropzone.mockReturnValue({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
      isDragActive: false,
      isDragAccept: false,
      isDragReject: false,
      open: vi.fn(),
    });
  });

  describe("Initial rendering states", () => {
    it("renders empty state when no mediaUrl is provided", () => {
      render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

      expect(screen.getByTestId("image-plus-icon")).toBeInTheDocument();
      expect(screen.getByTestId("upload-button")).toBeInTheDocument();
      expect(screen.queryByTestId("image-preview")).not.toBeInTheDocument();

      expect(mockT).toHaveBeenCalledWith("fileUploader.dragPhotoHere");
      expect(mockT).toHaveBeenCalledWith("fileUploader.selectFromComputer");
    });

    it("renders image preview when mediaUrl is provided", () => {
      const mediaUrl = "https://example.com/image.jpg";

      render(
        <FileUploader fieldChange={mockFieldChange} mediaUrl={mediaUrl} />
      );

      const imagePreview = screen.getByTestId("image-preview");
      expect(imagePreview).toBeInTheDocument();
      expect(imagePreview).toHaveAttribute("src", mediaUrl);
      expect(imagePreview).toHaveAttribute("alt", "Uploaded Image");

      expect(screen.queryByTestId("image-plus-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("upload-button")).not.toBeInTheDocument();
    });
  });

  describe("File upload functionality", () => {
    it("handles file upload and updates preview", () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockOnDrop = vi.fn();

      mockUseDropzone.mockReturnValue({
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        isDragActive: false,
        isDragAccept: false,
        isDragReject: false,
        open: vi.fn(),
      });

      // Mock the onDrop callback to simulate file drop
      mockUseDropzone.mockImplementationOnce((config: any) => {
        // Store the onDrop function for later use
        mockOnDrop.mockImplementation(config.onDrop);

        return {
          getRootProps: mockGetRootProps,
          getInputProps: mockGetInputProps,
          isDragActive: false,
          isDragAccept: false,
          isDragReject: false,
          open: vi.fn(),
        };
      });

      render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

      // Simulate file drop
      mockOnDrop([mockFile]);

      expect(mockFieldChange).toHaveBeenCalledWith(mockFile);
      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it("configures dropzone with correct accept types and options", () => {
      render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

      expect(mockUseDropzone).toHaveBeenCalledWith({
        onDrop: expect.any(Function),
        accept: {
          "image/*": [".png", ".jpeg", ".jpg"],
        },
        multiple: false,
      });
    });
  });
});
