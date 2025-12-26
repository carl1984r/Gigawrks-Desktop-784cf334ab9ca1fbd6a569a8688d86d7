package main

import (
	"Desktop-Wails-Gigawrks/controllers/chat"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	//config := wkwebview.NewConfiguration()

	// Create application with options
	err := wails.Run(&options.App{
		Title:       "Gigawrks-Meeting",
		Width:       1200,
		Height:      800,
		AlwaysOnTop: false,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		OnShutdown:       app.shutdown,
		Bind: []interface{}{
			app,
		},
		Linux: &linux.Options{
			WebviewGpuPolicy: linux.WebviewGpuPolicyOnDemand,
		},
		Windows: &windows.Options{
			WebviewGpuIsDisabled: false,
		},
		Mac: &mac.Options{
        TitleBar: &mac.TitleBar{
            TitlebarAppearsTransparent: true,
            HideTitle:                  false,
            HideTitleBar:               false,
            FullSizeContent:            true,
            UseToolbar:                 false,
            HideToolbarSeparator:       true,
        },
        Appearance:           mac.NSAppearanceNameDarkAqua,
        WebviewIsTransparent: true,
        WindowIsTranslucent:  true,
        About: &mac.AboutInfo{
            Title:   "Gigawrks-Meeting",
            Message: "© 2026 Gigawrks, LLC",
        },
    },
		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop:     true,
			DisableWebViewDrop: false,
		},
	})
	chat.OTOs = make(map[int][]chat.ContactMessage)
	if err != nil {
		println("Error:", err.Error())
	}
}
