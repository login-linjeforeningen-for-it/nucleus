#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_updater::UpdaterExt;

                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    let updater = match handle.updater() {
                        Ok(updater) => updater,
                        Err(error) => {
                            eprintln!("Login Desktop updater failed to initialize: {error}");
                            return;
                        }
                    };

                    let update = match updater.check().await {
                        Ok(update) => update,
                        Err(error) => {
                            eprintln!("Login Desktop update check failed: {error}");
                            return;
                        }
                    };

                    if let Some(update) = update {
                        let version = update.version.clone();
                        match update.download_and_install(|_, _| {}, || {}).await {
                            Ok(_) => {
                                eprintln!("Login Desktop updated to {version}; restarting.");
                                handle.restart();
                            }
                            Err(error) => eprintln!("Login Desktop update install failed: {error}"),
                        }
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Login Desktop");
}
