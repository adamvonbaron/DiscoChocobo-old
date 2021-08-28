import Config

import_config "#{Mix.env}.secret.exs" unless Mix.env == :prod
