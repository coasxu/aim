import os

from typing import Dict, Iterator, NamedTuple, Optional
from weakref import WeakValueDictionary

from pathlib import Path

from aim.storage.run import Run
from aim.storage.union import UnionContainer
from aim.storage.trace import QueryRunTraceCollection, QueryTraceCollection
from aim.storage.encoding import encode_path
from aim.storage.container import Container
from aim.storage.containerview import ContainerView
from aim.storage.singlecontainerview import SingleContainerView

from aim.storage.run_metadata.db import DB


class ContainerConfig(NamedTuple):
    name: str
    sub: Optional[str]
    read_only: bool


# TODO make this api thread-safe
class Repo:

    _pool = WeakValueDictionary()  # TODO: take read only into account

    def __init__(self, path: str, *, read_only: bool = None):
        if read_only is not None:
            raise NotImplementedError
        self.read_only = read_only
        self.path = path
        self.container_pool: Dict[ContainerConfig, Container] = WeakValueDictionary()
        self.persistent_pool: Dict[ContainerConfig, Container] = dict()
        self.container_view_pool: Dict[ContainerConfig, ContainerView] = WeakValueDictionary()

        os.makedirs(self.path, exist_ok=True)
        os.makedirs(os.path.join(self.path, "chunks"), exist_ok=True)
        os.makedirs(os.path.join(self.path, "locks"), exist_ok=True)
        os.makedirs(os.path.join(self.path, "progress"), exist_ok=True)

        self.meta_tree = self.request("meta", read_only=True, from_union=True).view(b"meta\xfe").tree()

        self.run_metadata_db = DB.from_path(path)

    def __repr__(self) -> str:
        return f"<Repo#{hash(self)} path={self.path} read_only={self.read_only}>"

    def __hash__(self) -> int:
        return hash(self.path)

    def __eq__(self, o: "Repo") -> bool:
        return self.path == o.path

    @classmethod
    def default_repo(cls):
        return cls.from_path(".aim")

    @classmethod
    def from_path(cls, path: str, read_only: bool = None):
        repo = cls._pool.get(path)
        if repo is None:
            repo = Repo(path, read_only=read_only)
            cls._pool[path] = repo
        return repo

    def get_container(
        self, name: str, read_only: bool, from_union: bool = False
    ) -> Container:
        if self.read_only and not read_only:
            raise ValueError("Repo is read-only")

        container_config = ContainerConfig(name, None, read_only=read_only)
        container = self.container_pool.get(container_config)
        if container is None:
            path = os.path.join(self.path, name)
            if from_union:
                container = UnionContainer(path, read_only=read_only)
                self.persistent_pool[container_config] = container
            else:
                container = Container(path, read_only=read_only)
            self.container_pool[container_config] = container

        return container

    def request(
        self,
        name: str,
        sub: str = None,
        *,
        read_only: bool,
        from_union: bool = False
    ):

        container_config = ContainerConfig(name, sub, read_only)
        container_view = self.container_view_pool.get(container_config)
        if container_view is None:
            if read_only:
                if from_union:
                    path = name
                else:
                    assert sub is not None
                    path = os.path.join(name, "chunks", sub)
                container = self.get_container(path, read_only=True, from_union=from_union)
            else:
                assert sub is not None
                from_union = False
                path = os.path.join(name, "chunks", sub)
                container = self.get_container(path, read_only=False)

            prefix = b""

            container_view = SingleContainerView(container=container, read_only=read_only, prefix=prefix)
            self.container_view_pool[container_config] = container_view

        return container_view

    def iter_runs(self) -> Iterator["Run"]:
        for run_name in self.meta_tree.keys():
            if run_name == "_":
                continue
            yield Run(run_name, repo=self, read_only=True)

    def query_runs(self, query: str = "") -> QueryRunTraceCollection:
        return QueryRunTraceCollection(self, query)

    def traces(self, query: str = ""):
        return QueryTraceCollection(repo=self, query=query)

    def iter_traces(self, query: str = ""):
        return self.traces(query=query)