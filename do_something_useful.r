#!/usr/bin/env Rscript

library(jsonlite)

search_terms <- commandArgs(trailingOnly = TRUE)


# do some searching here...

# (here just make some random numbers)
important_data <- runif(length(search_terms))


# return results
cat(toJSON(cbind(search_terms, important_data)))
