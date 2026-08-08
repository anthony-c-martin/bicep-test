from __future__ import annotations

import json
import os
import platform
import stat
import urllib.request
from pathlib import Path
from typing import Self

from ._rpc import RpcClient
from .models import SnapshotMetadata, SnapshotResult


class BicepTester:
    """Installs and invokes a pinned Bicep CLI for infrastructure tests."""

    def __init__(self, client: RpcClient) -> None:
        self._client = client

    @classmethod
    def create(cls, bicep_version: str) -> Self:
        """Install a Bicep CLI version if needed and start its RPC client."""
        if not bicep_version.strip():
            raise ValueError("bicep_version must not be empty")
        executable = _install_bicep(bicep_version)
        client = RpcClient(executable)
        version = client.call("bicep/version", {})["version"]
        if _version_tuple(version) < (0, 36, 1):
            client.close()
            raise RuntimeError(f"Bicep CLI 0.36.1 or later is required; detected {version}")
        return cls(client)

    def snapshot(
        self,
        file_path: str | os.PathLike[str],
        metadata: SnapshotMetadata | None = None,
    ) -> SnapshotResult:
        """Evaluate a Bicep parameters file without deploying it."""
        path = Path(file_path).resolve()
        response = self._client.call(
            "bicep/getSnapshot",
            {
                "path": str(path),
                "metadata": (metadata or SnapshotMetadata())._as_rpc_dict(),
            },
        )
        return SnapshotResult._from_dict(json.loads(response["snapshot"]))

    def close(self) -> None:
        """Disconnect from the Bicep CLI and terminate its process."""
        self._client.close()

    def __enter__(self) -> Self:
        return self

    def __exit__(self, *_: object) -> None:
        self.close()


def _install_bicep(version: str) -> Path:
    directory = Path.home() / ".bicep" / "bin" / f"v{version}"
    directory.mkdir(parents=True, exist_ok=True)
    artifact = _artifact_name()
    executable = directory / ("bicep.exe" if os.name == "nt" else "bicep")
    if executable.exists():
        return executable
    url = f"https://downloads.bicep.azure.com/v{version}/{artifact}"
    temporary = executable.with_suffix(executable.suffix + ".download")
    try:
        urllib.request.urlretrieve(url, temporary)
        temporary.chmod(temporary.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        temporary.replace(executable)
    finally:
        temporary.unlink(missing_ok=True)
    return executable


def _artifact_name() -> str:
    operating_system = platform.system().lower()
    architecture = platform.machine().lower()
    architecture_name = {
        "amd64": "x64",
        "x86_64": "x64",
        "arm64": "arm64",
        "aarch64": "arm64",
    }.get(architecture)
    system_name = {"windows": "win", "linux": "linux", "darwin": "osx"}.get(operating_system)
    if system_name is None or architecture_name is None:
        raise RuntimeError(f"Bicep CLI is not available for {operating_system}/{architecture}")
    extension = ".exe" if operating_system == "windows" else ""
    return f"bicep-{system_name}-{architecture_name}{extension}"


def _version_tuple(version: str) -> tuple[int, ...]:
    return tuple(int(part.split("-")[0]) for part in version.split("."))