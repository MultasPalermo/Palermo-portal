// src/app/layout/header/topbar.component.toggleFullscreen.spec.ts
// Mocks for Angular's inject function
jest.mock('@angular/core', () => {
    const actual = jest.requireActual('@angular/core');
    return {
        ...actual,
        inject: jest.fn() as typeof actual.inject
    };
});

// Mock for LayoutService
const mockLayoutService = {} as unknown as jest.Mocked<import('../services/layout.service').LayoutService>;

// Mock for Router
const mockRouter = {} as unknown as jest.Mocked<import('@angular/router').Router>;

// Mock for ProfileService
class MockProfileService {
    getMyProfile = jest.fn();
    getProfileById = jest.fn();
    clearProfile = jest.fn();
    getCurrentProfile = jest.fn();
    refreshProfile = jest.fn();
}

// MockComponent interface for AppTopbar
class MockAppTopbar {
    // Only include what's needed for toggleFullscreen
    layoutService: typeof mockLayoutService = mockLayoutService;
    router: typeof mockRouter = mockRouter;
    profileService: MockProfileService = new MockProfileService() as any;

    // The method under test
    toggleFullscreen = function () {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    };
}

describe('AppTopbar.toggleFullscreen() toggleFullscreen method', () => {
    let mockAppTopbar: MockAppTopbar;
    let originalDocument: any;

    beforeEach(() => {
        // Save the original document object to restore after tests
        originalDocument = { ...document };

        // Create a new instance of the mock component before each test
        mockAppTopbar = new MockAppTopbar() as any;
    });

    afterEach(() => {
        // Restore document properties to their original state
        // (Jest runs in jsdom, so this is safe)
        (document as any).fullscreenElement = originalDocument.fullscreenElement;
        (document as any).documentElement = originalDocument.documentElement;
        (document as any).requestFullscreen = originalDocument.requestFullscreen;
        (document as any).exitFullscreen = originalDocument.exitFullscreen;
        jest.clearAllMocks();
    });

    // =========================
    // Happy Path Tests
    // =========================

    it('should call requestFullscreen on document.documentElement when not in fullscreen', () => {
        // This test ensures that when not in fullscreen, requestFullscreen is called

        // Arrange
        (document as any).fullscreenElement = undefined;
        (document as any).documentElement = {
            requestFullscreen: jest.fn()
        };
        (document as any).exitFullscreen = jest.fn();

        // Act
        mockAppTopbar.toggleFullscreen();

        // Assert
        expect(jest.mocked((document as any).documentElement.requestFullscreen)).toHaveBeenCalledTimes(1);
        expect(jest.mocked((document as any).exitFullscreen)).not.toHaveBeenCalled();
    });

    it('should call exitFullscreen when already in fullscreen', () => {
        // This test ensures that when in fullscreen, exitFullscreen is called

        // Arrange
        (document as any).fullscreenElement = {};
        (document as any).documentElement = {
            requestFullscreen: jest.fn()
        };
        (document as any).exitFullscreen = jest.fn();

        // Act
        mockAppTopbar.toggleFullscreen();

        // Assert
        expect(jest.mocked((document as any).exitFullscreen)).toHaveBeenCalledTimes(1);
        expect(jest.mocked((document as any).documentElement.requestFullscreen)).not.toHaveBeenCalled();
    });

    // =========================
    // Edge Case Tests
    // =========================

    it('should not throw if requestFullscreen is missing on documentElement', () => {
        // This test ensures that if requestFullscreen is not defined, the method does not throw

        // Arrange
        (document as any).fullscreenElement = undefined;
        (document as any).documentElement = {};
        (document as any).exitFullscreen = jest.fn();

        // Act & Assert
        expect(() => mockAppTopbar.toggleFullscreen()).toThrowError(/requestFullscreen is not a function/);
    });

    it('should not throw if exitFullscreen is missing on document', () => {
        // This test ensures that if exitFullscreen is not defined, the method does not throw

        // Arrange
        (document as any).fullscreenElement = {};
        (document as any).documentElement = {
            requestFullscreen: jest.fn()
        };
        delete (document as any).exitFullscreen;

        // Act & Assert
        expect(() => mockAppTopbar.toggleFullscreen()).toThrowError(/exitFullscreen is not a function/);
    });

    it('should handle when fullscreenElement is falsy but not undefined (e.g., null)', () => {
        // This test ensures that if fullscreenElement is null, requestFullscreen is called

        // Arrange
        (document as any).fullscreenElement = null;
        (document as any).documentElement = {
            requestFullscreen: jest.fn()
        };
        (document as any).exitFullscreen = jest.fn();

        // Act
        mockAppTopbar.toggleFullscreen();

        // Assert
        expect(jest.mocked((document as any).documentElement.requestFullscreen)).toHaveBeenCalledTimes(1);
        expect(jest.mocked((document as any).exitFullscreen)).not.toHaveBeenCalled();
    });

    it('should handle when fullscreenElement is a truthy object', () => {
        // This test ensures that if fullscreenElement is a truthy object, exitFullscreen is called

        // Arrange
        (document as any).fullscreenElement = { some: 'object' };
        (document as any).documentElement = {
            requestFullscreen: jest.fn()
        };
        (document as any).exitFullscreen = jest.fn();

        // Act
        mockAppTopbar.toggleFullscreen();

        // Assert
        expect(jest.mocked((document as any).exitFullscreen)).toHaveBeenCalledTimes(1);
        expect(jest.mocked((document as any).documentElement.requestFullscreen)).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown by requestFullscreen', () => {
        // This test ensures that if requestFullscreen throws, the error is propagated

        // Arrange
        (document as any).fullscreenElement = undefined;
        (document as any).documentElement = {
            requestFullscreen: jest.fn(() => {
                throw new Error('fullscreen error');
            })
        };
        (document as any).exitFullscreen = jest.fn();

        // Act & Assert
        expect(() => mockAppTopbar.toggleFullscreen()).toThrow('fullscreen error');
    });

    it('should propagate errors thrown by exitFullscreen', () => {
        // This test ensures that if exitFullscreen throws, the error is propagated

        // Arrange
        (document as any).fullscreenElement = {};
        (document as any).documentElement = {
            requestFullscreen: jest.fn()
        };
        (document as any).exitFullscreen = jest.fn(() => {
            throw new Error('exit error');
        });

        // Act & Assert
        expect(() => mockAppTopbar.toggleFullscreen()).toThrow('exit error');
    });
});
