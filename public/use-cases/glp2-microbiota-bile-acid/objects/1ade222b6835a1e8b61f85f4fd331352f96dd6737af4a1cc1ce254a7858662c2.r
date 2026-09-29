# sample_script.R
# A simple R example script

main <- function() {
  cat(paste(rep("=", 40), collapse = ""), "\n")
  cat("R Runtime Check\n")
  cat(paste(rep("=", 40), collapse = ""), "\n")
  cat(sprintf("R version: %s\n", R.version.string))
  cat(sprintf("Platform: %s\n", R.version$platform))
  cat(sprintf("OS: %s\n", R.version$os))
  cat(paste(rep("=", 40), collapse = ""), "\n")
}

main()
