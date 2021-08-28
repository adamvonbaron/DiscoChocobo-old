import Config

unless Mix.env == :prod do
  import_config "#{Mix.env}.secret.exs"
end
