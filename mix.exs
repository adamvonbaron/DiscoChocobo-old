defmodule DiscoChocobo.MixProject do
  use Mix.Project

  def project do
    [
      app: :disco_chocobo,
      version: "0.1.0",
      elixir: "~> 1.12",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {DiscoChocobo.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:nostrum, "~> 0.4"},
      {:dotenv, "~> 3.1", only: [:dev, :test]}
    ]
  end
end
