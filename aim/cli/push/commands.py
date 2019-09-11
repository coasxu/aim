import click
from urllib.parse import urlparse

from aim.push.tcp_client import FileserverClient


@click.command()
@click.option('-r', '--remote', default='origin', type=str)
@click.pass_obj
def push(repo, remote):
    if repo is None:
        click.echo('Repository does not exist')
        return

    click.echo('Counting objects')

    files = repo.ls_files()
    files_len = len(files)

    click.echo('{} file(s) to send:'.format(files_len))

    # open connection
    parsed_remote = urlparse(repo.get_remote_url(remote))
    remote_project = parsed_remote.path.strip('/')
    try:
        tcp_client = FileserverClient(parsed_remote.hostname,
                                      parsed_remote.port)
    except Exception:
        click.echo('Can not open connection to remote. ' +
                   'Check if remote {} exists'.format(remote))
        return

    # send files count
    tcp_client.write(files_len)

    with click.progressbar(files) as bar:
        for f in bar:
            # send file path
            send_file_path = '{project}/{file_path}'.format(
                project=remote_project,
                file_path=f[len(repo.path) + 1:])
            tcp_client.write(send_file_path)

            # send file content line by line
            with open(f, 'r') as content_file:
                for l in content_file.readlines():
                    tcp_client.write(l)

            # send end tag
            tcp_client.write('---ENDOFDATA---')

    # close connection
    del tcp_client