# Git flow 工作流

## 概念

Master 是指将所有的正式版本代码都放在此分支上面去了，它是一个作为上线，并且稳定的上线分支。

Develop 是指存储所有开发过的代码，作为开发版本的分支。它会克隆 Master 分支上的代码，并且会合并 feature 分支的代码。

Feature 是指团队人员开发的分支， 最终会被合并到 Develop 分支上。

Release 是指即将发布的版本分支，它是用来做测试和修改 Bug 的一个分支。此分支的生命周期非常短，结束后会合并到 Master 和 Develop 分支上。

HotFix 是指在线上的修复和 Release 上的修复分支。

---

## 使用

使用`git flow`命令来创建一个 git 流。

创建一个`git flow`流：

```bash
git flow init
```

开启一个 featrue 分支，并且切换到分支上：

```bash
git flow featrue start [featrue name]
```

完成 featrue 分支，并切换到 develop 分支上：

```bash
git flow featrue finish  [featrue name]
```

开启一个 hotfix 分支，并且切换到上面去：

```bash
git flow hotfix start [hotfix name]
```

完成 hotfix 分支，并且回归到 develop 和 master 分支上：

```bash
git flow hotfix finish [hotfix name]
```

开启一个 release 分支，并且切换到 release 分支上去。

```bash
git flow release start [release name]
```

完成 release 分支，并回归到develop分支和master分支上。

```bashs
git flow release finish [release name]
```


